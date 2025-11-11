const prisma = require('../config/database');
const uploadService = require('../services/upload.service');
const emailService = require('../services/email.service');
const { validatePagination } = require('../utils/pagination');

class OcorrenciaController {
  // Criar nova ocorrência
  async create(req, res) {
    let uploadedPhotos = []; // Mover para escopo da função para permitir acesso no catch

    try {
      const { titulo, descricao, categoria, endereco, latitude, longitude, prioridade } = req.body;
      const vereadorId = req.userId;

      // Validar tipo de usuário
      if (req.userType !== 'VEREADOR') {
        return res.status(403).json({ error: 'Apenas vereadores podem criar ocorrências' });
      }

      // Upload das fotos primeiro (antes da transação)
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => uploadService.uploadImage(file));
        uploadedPhotos = await Promise.all(uploadPromises);
      }

      // Usar transação para garantir atomicidade
      const ocorrenciaCompleta = await prisma.$transaction(async (tx) => {
        // 1. Criar ocorrência
        const ocorrencia = await tx.ocorrencia.create({
          data: {
            titulo,
            descricao,
            categoria: categoria || 'OUTROS',
            endereco,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            prioridade: prioridade || 'MEDIA',
            vereadorId
          }
        });

        // 2. Criar fotos (se houver)
        if (uploadedPhotos.length > 0) {
          await tx.foto.createMany({
            data: uploadedPhotos.map((upload, index) => ({
              ocorrenciaId: ocorrencia.id,
              urlFoto: upload.url,
              thumbnailUrl: upload.thumbnail,
              ordem: index
            }))
          });
        }

        // 3. Criar histórico
        await tx.historico.create({
          data: {
            ocorrenciaId: ocorrencia.id,
            usuarioId: vereadorId,
            acao: 'CRIADA',
            comentario: 'Ocorrência criada'
          }
        });

        // 4. Buscar ocorrência completa
        return await tx.ocorrencia.findUnique({
          where: { id: ocorrencia.id },
          include: {
            fotos: true,
            vereador: {
              select: { nome: true, email: true }
            }
          }
        });
      });

      // Notificar equipe jurídica (fora da transação - não crítico)
      try {
        await emailService.notifyJuridicoNewOcorrencia(ocorrenciaCompleta);
      } catch (emailError) {
        console.error('Erro ao enviar email (não crítico):', emailError);
      }

      res.status(201).json(ocorrenciaCompleta);
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);

      // Rollback manual: limpar fotos do Cloudinary se upload foi feito
      if (uploadedPhotos.length > 0) {
        console.log(`Fazendo rollback de ${uploadedPhotos.length} fotos do Cloudinary...`);

        const deletePromises = uploadedPhotos.map(photo =>
          uploadService.deleteImage(photo.publicId).catch(err => {
            console.error(`Falha ao deletar foto ${photo.publicId}:`, err);
          })
        );

        await Promise.allSettled(deletePromises);
        console.log('Rollback de fotos concluído');
      }

      res.status(500).json({ error: 'Erro ao criar ocorrência' });
    }
  }

  // Listar ocorrências
  async list(req, res) {
    try {
      const { status, categoria, vereadorId } = req.query;
      const { page, limit, skip } = validatePagination(req.query);

      // Filtros
      const where = {};

      // Vereadores só veem suas próprias ocorrências
      if (req.userType === 'VEREADOR') {
        where.vereadorId = req.userId;
      } else if (vereadorId) {
        where.vereadorId = vereadorId;
      }

      if (status) {
        where.status = status;
      }

      if (categoria) {
        where.categoria = categoria;
      }

      const [ocorrencias, total] = await Promise.all([
        prisma.ocorrencia.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            fotos: {
              orderBy: { ordem: 'asc' }
            },
            vereador: {
              select: { nome: true, email: true }
            }
          }
        }),
        prisma.ocorrencia.count({ where })
      ]);

      res.json({
        ocorrencias,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar ocorrências:', error);
      res.status(500).json({ error: 'Erro ao listar ocorrências' });
    }
  }

  // Obter detalhes de uma ocorrência
  async getById(req, res) {
    try {
      const { id } = req.params;

      const ocorrencia = await prisma.ocorrencia.findUnique({
        where: { id },
        include: {
          fotos: {
            orderBy: { ordem: 'asc' }
          },
          vereador: {
            select: { nome: true, email: true, telefone: true }
          },
          historicos: {
            include: {
              usuario: {
                select: { nome: true, tipo: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!ocorrencia) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }

      // Vereadores só podem ver suas próprias ocorrências
      if (req.userType === 'VEREADOR' && ocorrencia.vereadorId !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      res.json(ocorrencia);
    } catch (error) {
      console.error('Erro ao buscar ocorrência:', error);
      res.status(500).json({ error: 'Erro ao buscar ocorrência' });
    }
  }

  // Atualizar status (apenas jurídico e admin)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, comentario } = req.body;

      if (!['EM_ANALISE', 'RESOLVIDO', 'REJEITADO'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const ocorrencia = await prisma.ocorrencia.findUnique({
        where: { id },
        include: {
          vereador: true
        }
      });

      if (!ocorrencia) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }

      // Atualizar status
      const updatedOcorrencia = await prisma.ocorrencia.update({
        where: { id },
        data: { status }
      });

      // Criar histórico
      await prisma.historico.create({
        data: {
          ocorrenciaId: id,
          usuarioId: req.userId,
          acao: `STATUS_ALTERADO_${status}`,
          comentario: comentario || `Status alterado para ${status}`
        }
      });

      // Notificar vereador
      await prisma.notificacao.create({
        data: {
          usuarioId: ocorrencia.vereadorId,
          tipo: 'STATUS_ALTERADO',
          titulo: 'Status da Ocorrência Atualizado',
          mensagem: `Sua ocorrência "${ocorrencia.titulo}" teve o status alterado para ${status}`
        }
      });

      res.json(updatedOcorrencia);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  // Deletar ocorrência (apenas criador se pendente, ou admin)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const ocorrencia = await prisma.ocorrencia.findUnique({
        where: { id },
        include: { fotos: true }
      });

      if (!ocorrencia) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }

      // Vereador só pode deletar suas próprias ocorrências pendentes
      if (req.userType === 'VEREADOR') {
        if (ocorrencia.vereadorId !== req.userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
        if (ocorrencia.status !== 'PENDENTE') {
          return res.status(403).json({ error: 'Apenas ocorrências pendentes podem ser deletadas' });
        }
      }

      // Deletar fotos do Cloudinary ANTES de deletar do banco
      if (ocorrencia.fotos.length > 0) {
        console.log(`Deletando ${ocorrencia.fotos.length} fotos do Cloudinary...`);

        const deletePromises = ocorrencia.fotos.map(foto => {
          // Extrair publicId da URL
          const urlParts = foto.urlFoto.split('/');
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = `ocorrencias/${publicIdWithExt.split('.')[0]}`;

          return uploadService.deleteImage(publicId).catch(err => {
            console.error(`Falha ao deletar foto ${publicId}:`, err);
          });
        });

        await Promise.allSettled(deletePromises);
        console.log('Fotos deletadas do Cloudinary');
      }

      await prisma.ocorrencia.delete({
        where: { id }
      });

      res.json({ message: 'Ocorrência deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar ocorrência:', error);
      res.status(500).json({ error: 'Erro ao deletar ocorrência' });
    }
  }

  // Estatísticas (admin e jurídico)
  async getStats(req, res) {
    try {
      const [total, pendentes, emAnalise, resolvidas, porCategoria] = await Promise.all([
        prisma.ocorrencia.count(),
        prisma.ocorrencia.count({ where: { status: 'PENDENTE' } }),
        prisma.ocorrencia.count({ where: { status: 'EM_ANALISE' } }),
        prisma.ocorrencia.count({ where: { status: 'RESOLVIDO' } }),
        prisma.ocorrencia.groupBy({
          by: ['categoria'],
          _count: true
        })
      ]);

      res.json({
        total,
        pendentes,
        emAnalise,
        resolvidas,
        porCategoria
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

module.exports = new OcorrenciaController();
