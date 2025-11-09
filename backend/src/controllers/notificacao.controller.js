const prisma = require('../config/database');
const { validatePagination } = require('../utils/pagination');

class NotificacaoController {
  // Listar notificações do usuário logado
  async list(req, res) {
    try {
      const { lida, tipo } = req.query;
      const { page, limit, skip } = validatePagination(req.query, { defaultLimit: 50 });

      const where = { usuarioId: req.userId };

      if (lida !== undefined) {
        where.lida = lida === 'true';
      }

      if (tipo) {
        where.tipo = tipo;
      }

      const [notificacoes, total] = await Promise.all([
        prisma.notificacao.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.notificacao.count({ where })
      ]);

      res.json({
        notificacoes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      res.status(500).json({ error: 'Erro ao listar notificações' });
    }
  }

  // Obter detalhes de uma notificação
  async getById(req, res) {
    try {
      const { id } = req.params;

      const notificacao = await prisma.notificacao.findUnique({
        where: { id }
      });

      if (!notificacao) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      // Verificar se a notificação pertence ao usuário logado
      if (notificacao.usuarioId !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Marcar como lida automaticamente
      if (!notificacao.lida) {
        await prisma.notificacao.update({
          where: { id },
          data: { lida: true }
        });
        notificacao.lida = true;
      }

      res.json(notificacao);
    } catch (error) {
      console.error('Erro ao buscar notificação:', error);
      res.status(500).json({ error: 'Erro ao buscar notificação' });
    }
  }

  // Marcar notificação como lida
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const notificacao = await prisma.notificacao.findUnique({
        where: { id }
      });

      if (!notificacao) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      if (notificacao.usuarioId !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const updated = await prisma.notificacao.update({
        where: { id },
        data: { lida: true }
      });

      res.json(updated);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      res.status(500).json({ error: 'Erro ao atualizar notificação' });
    }
  }

  // Marcar notificação como não lida
  async markAsUnread(req, res) {
    try {
      const { id } = req.params;

      const notificacao = await prisma.notificacao.findUnique({
        where: { id }
      });

      if (!notificacao) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      if (notificacao.usuarioId !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const updated = await prisma.notificacao.update({
        where: { id },
        data: { lida: false }
      });

      res.json(updated);
    } catch (error) {
      console.error('Erro ao marcar notificação como não lida:', error);
      res.status(500).json({ error: 'Erro ao atualizar notificação' });
    }
  }

  // Marcar todas como lidas
  async markAllAsRead(req, res) {
    try {
      const result = await prisma.notificacao.updateMany({
        where: {
          usuarioId: req.userId,
          lida: false
        },
        data: { lida: true }
      });

      res.json({
        message: 'Todas as notificações foram marcadas como lidas',
        count: result.count
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      res.status(500).json({ error: 'Erro ao atualizar notificações' });
    }
  }

  // Contar notificações não lidas
  async countUnread(req, res) {
    try {
      const count = await prisma.notificacao.count({
        where: {
          usuarioId: req.userId,
          lida: false
        }
      });

      res.json({ count });
    } catch (error) {
      console.error('Erro ao contar notificações:', error);
      res.status(500).json({ error: 'Erro ao contar notificações' });
    }
  }

  // Deletar uma notificação
  async delete(req, res) {
    try {
      const { id } = req.params;

      const notificacao = await prisma.notificacao.findUnique({
        where: { id }
      });

      if (!notificacao) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      if (notificacao.usuarioId !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await prisma.notificacao.delete({
        where: { id }
      });

      res.json({ message: 'Notificação deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      res.status(500).json({ error: 'Erro ao deletar notificação' });
    }
  }

  // Deletar todas as notificações lidas
  async deleteAllRead(req, res) {
    try {
      const result = await prisma.notificacao.deleteMany({
        where: {
          usuarioId: req.userId,
          lida: true
        }
      });

      res.json({
        message: 'Todas as notificações lidas foram deletadas',
        count: result.count
      });
    } catch (error) {
      console.error('Erro ao deletar notificações:', error);
      res.status(500).json({ error: 'Erro ao deletar notificações' });
    }
  }

  // Criar notificação (apenas para testes ou uso interno por admin)
  async create(req, res) {
    try {
      const { usuarioId, tipo, titulo, mensagem } = req.body;

      // Apenas admin pode criar notificações manualmente
      if (req.userType !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas administradores podem criar notificações' });
      }

      const notificacao = await prisma.notificacao.create({
        data: {
          usuarioId,
          tipo,
          titulo,
          mensagem
        }
      });

      res.status(201).json(notificacao);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      res.status(500).json({ error: 'Erro ao criar notificação' });
    }
  }
}

module.exports = new NotificacaoController();
