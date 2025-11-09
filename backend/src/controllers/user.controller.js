const prisma = require('../config/database');
const emailService = require('../services/email.service');
const uploadService = require('../services/upload.service');
const { validatePagination } = require('../utils/pagination');

class UserController {
  // Listar todos os usuários (apenas admin)
  async list(req, res) {
    try {
      const { tipo, status } = req.query;
      const { page, limit, skip } = validatePagination(req.query);

      const where = {};

      if (tipo) {
        where.tipo = tipo;
      }

      if (status) {
        where.status = status;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
            telefone: true,
            tipo: true,
            status: true,
            fotoPerfil: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  // Listar usuários pendentes de aprovação (apenas admin)
  async listPending(req, res) {
    try {
      const users = await prisma.user.findMany({
        where: { status: 'PENDENTE' },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          tipo: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários pendentes:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  // Obter detalhes de um usuário (apenas admin)
  async getById(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          tipo: true,
          status: true,
          fotoPerfil: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ocorrencias: true,
              notificacoes: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  // Aprovar usuário (apenas admin)
  async approve(req, res) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (user.status !== 'PENDENTE') {
        return res.status(400).json({ error: 'Usuário não está pendente de aprovação' });
      }

      // Validar tipo se fornecido
      if (tipo && !['ADMIN', 'VEREADOR', 'JURIDICO'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de usuário inválido. Use: ADMIN, VEREADOR ou JURIDICO' });
      }

      // Preparar dados para atualização
      const updateData = { status: 'ATIVO' };

      // Se tipo foi fornecido, atualizar também
      if (tipo) {
        updateData.tipo = tipo;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          status: true
        }
      });

      // Enviar email de aprovação
      await emailService.notifyUserApproved(updatedUser);

      // Criar notificação
      const tipoMensagem = tipo ? ` como ${tipo}` : '';
      await prisma.notificacao.create({
        data: {
          usuarioId: id,
          tipo: 'APROVACAO',
          titulo: 'Cadastro Aprovado',
          mensagem: `Seu cadastro foi aprovado${tipoMensagem}! Agora você pode utilizar o sistema.`
        }
      });

      res.json({ message: 'Usuário aprovado com sucesso', user: updatedUser });
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      res.status(500).json({ error: 'Erro ao aprovar usuário' });
    }
  }

  // Rejeitar/Desativar usuário (apenas admin)
  async deactivate(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Não permitir desativar o próprio admin
      if (id === req.userId) {
        return res.status(400).json({ error: 'Você não pode desativar sua própria conta' });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: 'INATIVO' },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          status: true
        }
      });

      // Criar notificação
      await prisma.notificacao.create({
        data: {
          usuarioId: id,
          tipo: 'DESATIVACAO',
          titulo: 'Conta Desativada',
          mensagem: motivo || 'Sua conta foi desativada pelo administrador.'
        }
      });

      res.json({ message: 'Usuário desativado com sucesso', user: updatedUser });
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      res.status(500).json({ error: 'Erro ao desativar usuário' });
    }
  }

  // Reativar usuário (apenas admin)
  async reactivate(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (user.status !== 'INATIVO') {
        return res.status(400).json({ error: 'Usuário não está inativo' });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: 'ATIVO' },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          status: true
        }
      });

      // Criar notificação
      await prisma.notificacao.create({
        data: {
          usuarioId: id,
          tipo: 'REATIVACAO',
          titulo: 'Conta Reativada',
          mensagem: 'Sua conta foi reativada pelo administrador.'
        }
      });

      res.json({ message: 'Usuário reativado com sucesso', user: updatedUser });
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      res.status(500).json({ error: 'Erro ao reativar usuário' });
    }
  }

  // Atualizar tipo de usuário (apenas admin)
  async updateType(req, res) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      if (!['ADMIN', 'VEREADOR', 'JURIDICO'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de usuário inválido' });
      }

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Não permitir alterar o tipo do próprio admin
      if (id === req.userId) {
        return res.status(400).json({ error: 'Você não pode alterar o tipo da sua própria conta' });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { tipo },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          status: true
        }
      });

      // Criar notificação
      await prisma.notificacao.create({
        data: {
          usuarioId: id,
          tipo: 'ALTERACAO_TIPO',
          titulo: 'Tipo de Conta Alterado',
          mensagem: `Seu tipo de conta foi alterado para ${tipo}.`
        }
      });

      res.json({ message: 'Tipo de usuário atualizado com sucesso', user: updatedUser });
    } catch (error) {
      console.error('Erro ao atualizar tipo de usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar tipo de usuário' });
    }
  }

  // Upload de foto de perfil
  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId }
      });

      // Deletar foto antiga se existir
      if (user.fotoPerfil) {
        // Extrair publicId da URL do Cloudinary
        const urlParts = user.fotoPerfil.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `perfil/${publicIdWithExt.split('.')[0]}`;
        await uploadService.deleteImage(publicId);
      }

      // Upload da nova foto
      const uploadResult = await uploadService.uploadImage(req.file);

      const updatedUser = await prisma.user.update({
        where: { id: req.userId },
        data: { fotoPerfil: uploadResult.url },
        select: {
          id: true,
          nome: true,
          email: true,
          fotoPerfil: true
        }
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao fazer upload da foto de perfil:', error);
      res.status(500).json({ error: 'Erro ao fazer upload da foto' });
    }
  }

  // Deletar usuário permanentemente (apenas admin, com cuidado)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: { ocorrencias: true }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Não permitir deletar o próprio admin
      if (id === req.userId) {
        return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
      }

      // Avisar se o usuário tem ocorrências
      if (user._count.ocorrencias > 0) {
        return res.status(400).json({
          error: `Usuário possui ${user._count.ocorrencias} ocorrências. Desative a conta ao invés de deletar.`
        });
      }

      await prisma.user.delete({
        where: { id }
      });

      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }

  // Estatísticas de usuários (apenas admin)
  async getStats(req, res) {
    try {
      const [total, ativos, pendentes, inativos, porTipo] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ATIVO' } }),
        prisma.user.count({ where: { status: 'PENDENTE' } }),
        prisma.user.count({ where: { status: 'INATIVO' } }),
        prisma.user.groupBy({
          by: ['tipo'],
          _count: true
        })
      ]);

      res.json({
        total,
        ativos,
        pendentes,
        inativos,
        porTipo
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

module.exports = new UserController();
