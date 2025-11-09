const notificacaoController = require('../../../src/controllers/notificacao.controller');
const prisma = require('../../../src/config/database');

describe('NotificacaoController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      userId: 'user-123',
      userType: 'VEREADOR'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('list', () => {
    it('deve listar notificações do usuário logado', async () => {
      req.query = { page: 1, limit: 50 };

      const mockNotificacoes = [
        {
          id: '1',
          usuarioId: 'user-123',
          tipo: 'APROVACAO',
          titulo: 'Cadastro Aprovado',
          mensagem: 'Seu cadastro foi aprovado!',
          lida: false,
          createdAt: new Date()
        },
        {
          id: '2',
          usuarioId: 'user-123',
          tipo: 'STATUS_ALTERADO',
          titulo: 'Status Alterado',
          mensagem: 'Status da ocorrência foi alterado',
          lida: true,
          createdAt: new Date()
        }
      ];

      prisma.notificacao.findMany.mockResolvedValue(mockNotificacoes);
      prisma.notificacao.count.mockResolvedValue(2);

      await notificacaoController.list(req, res);

      expect(prisma.notificacao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId: 'user-123' },
          orderBy: { createdAt: 'desc' }
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        notificacoes: mockNotificacoes,
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          pages: 1
        }
      });
    });

    it('deve filtrar por lida=true', async () => {
      req.query = { lida: 'true', page: 1, limit: 50 };

      prisma.notificacao.findMany.mockResolvedValue([]);
      prisma.notificacao.count.mockResolvedValue(0);

      await notificacaoController.list(req, res);

      expect(prisma.notificacao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            usuarioId: 'user-123',
            lida: true
          }
        })
      );
    });

    it('deve filtrar por lida=false', async () => {
      req.query = { lida: 'false', page: 1, limit: 50 };

      prisma.notificacao.findMany.mockResolvedValue([]);
      prisma.notificacao.count.mockResolvedValue(0);

      await notificacaoController.list(req, res);

      expect(prisma.notificacao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            usuarioId: 'user-123',
            lida: false
          }
        })
      );
    });

    it('deve filtrar por tipo', async () => {
      req.query = { tipo: 'APROVACAO', page: 1, limit: 50 };

      prisma.notificacao.findMany.mockResolvedValue([]);
      prisma.notificacao.count.mockResolvedValue(0);

      await notificacaoController.list(req, res);

      expect(prisma.notificacao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            usuarioId: 'user-123',
            tipo: 'APROVACAO'
          }
        })
      );
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      prisma.notificacao.findMany.mockRejectedValue(new Error('Database error'));

      await notificacaoController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar notificações' });
    });
  });

  describe('getById', () => {
    it('deve retornar notificação do usuário', async () => {
      req.params.id = 'notif-123';

      const mockNotificacao = {
        id: 'notif-123',
        usuarioId: 'user-123',
        tipo: 'APROVACAO',
        titulo: 'Teste',
        mensagem: 'Mensagem',
        lida: true
      };

      prisma.notificacao.findUnique.mockResolvedValue(mockNotificacao);

      await notificacaoController.getById(req, res);

      expect(prisma.notificacao.findUnique).toHaveBeenCalledWith({
        where: { id: 'notif-123' }
      });
      expect(res.json).toHaveBeenCalledWith(mockNotificacao);
    });

    it('deve marcar notificação como lida ao buscar se estava não lida', async () => {
      req.params.id = 'notif-123';

      const mockNotificacao = {
        id: 'notif-123',
        usuarioId: 'user-123',
        lida: false
      };

      prisma.notificacao.findUnique.mockResolvedValue(mockNotificacao);
      prisma.notificacao.update.mockResolvedValue({
        ...mockNotificacao,
        lida: true
      });

      await notificacaoController.getById(req, res);

      expect(prisma.notificacao.update).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
        data: { lida: true }
      });
    });

    it('deve não atualizar se já estava lida', async () => {
      req.params.id = 'notif-123';

      const mockNotificacao = {
        id: 'notif-123',
        usuarioId: 'user-123',
        lida: true
      };

      prisma.notificacao.findUnique.mockResolvedValue(mockNotificacao);

      await notificacaoController.getById(req, res);

      expect(prisma.notificacao.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se notificação não encontrada', async () => {
      req.params.id = 'notif-inexistente';

      prisma.notificacao.findUnique.mockResolvedValue(null);

      await notificacaoController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Notificação não encontrada' });
    });

    it('deve retornar erro 403 para notificação de outro usuário', async () => {
      req.params.id = 'notif-123';

      prisma.notificacao.findUnique.mockResolvedValue({
        id: 'notif-123',
        usuarioId: 'other-user'
      });

      await notificacaoController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado' });
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      req.params.id = 'notif-123';

      prisma.notificacao.findUnique.mockRejectedValue(new Error('Database error'));

      await notificacaoController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar notificação' });
    });
  });

  describe('markAsRead', () => {
    it('deve marcar notificação como lida', async () => {
      req.params.id = 'notif-123';

      const mockNotificacao = {
        id: 'notif-123',
        usuarioId: 'user-123',
        lida: false
      };

      prisma.notificacao.findUnique.mockResolvedValue(mockNotificacao);
      const updatedNotificacao = {
        ...mockNotificacao,
        lida: true
      };
      prisma.notificacao.update.mockResolvedValue(updatedNotificacao);

      await notificacaoController.markAsRead(req, res);

      expect(prisma.notificacao.update).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
        data: { lida: true }
      });
      expect(res.json).toHaveBeenCalledWith(updatedNotificacao);
    });

    it('deve retornar erro 404 se notificação não encontrada', async () => {
      req.params.id = 'notif-inexistente';

      prisma.notificacao.findUnique.mockResolvedValue(null);

      await notificacaoController.markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Notificação não encontrada' });
    });

    it('deve retornar erro 403 para notificação de outro usuário', async () => {
      req.params.id = 'notif-123';

      prisma.notificacao.findUnique.mockResolvedValue({
        id: 'notif-123',
        usuarioId: 'other-user'
      });

      await notificacaoController.markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado' });
    });
  });

  describe('markAsUnread', () => {
    it('deve marcar notificação como não lida', async () => {
      req.params.id = 'notif-123';

      const mockNotificacao = {
        id: 'notif-123',
        usuarioId: 'user-123',
        lida: true
      };

      prisma.notificacao.findUnique.mockResolvedValue(mockNotificacao);
      prisma.notificacao.update.mockResolvedValue({
        ...mockNotificacao,
        lida: false
      });

      await notificacaoController.markAsUnread(req, res);

      expect(prisma.notificacao.update).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
        data: { lida: false }
      });
    });
  });

  describe('markAllAsRead', () => {
    it('deve marcar todas notificações do usuário como lidas', async () => {
      prisma.notificacao.updateMany.mockResolvedValue({ count: 5 });

      await notificacaoController.markAllAsRead(req, res);

      expect(prisma.notificacao.updateMany).toHaveBeenCalledWith({
        where: {
          usuarioId: 'user-123',
          lida: false
        },
        data: { lida: true }
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todas as notificações foram marcadas como lidas',
        count: 5
      });
    });

    it('deve retornar count=0 se não houver não lidas', async () => {
      prisma.notificacao.updateMany.mockResolvedValue({ count: 0 });

      await notificacaoController.markAllAsRead(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Todas as notificações foram marcadas como lidas',
        count: 0
      });
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      prisma.notificacao.updateMany.mockRejectedValue(new Error('Database error'));

      await notificacaoController.markAllAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao atualizar notificações' });
    });
  });

  describe('countUnread', () => {
    it('deve retornar contagem de não lidas', async () => {
      prisma.notificacao.count.mockResolvedValue(3);

      await notificacaoController.countUnread(req, res);

      expect(prisma.notificacao.count).toHaveBeenCalledWith({
        where: {
          usuarioId: 'user-123',
          lida: false
        }
      });
      expect(res.json).toHaveBeenCalledWith({ count: 3 });
    });

    it('deve retornar 0 se todas lidas', async () => {
      prisma.notificacao.count.mockResolvedValue(0);

      await notificacaoController.countUnread(req, res);

      expect(res.json).toHaveBeenCalledWith({ count: 0 });
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      prisma.notificacao.count.mockRejectedValue(new Error('Database error'));

      await notificacaoController.countUnread(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao contar notificações' });
    });
  });

  describe('delete', () => {
    it('deve deletar notificação do usuário', async () => {
      req.params.id = 'notif-123';

      const mockNotificacao = {
        id: 'notif-123',
        usuarioId: 'user-123'
      };

      prisma.notificacao.findUnique.mockResolvedValue(mockNotificacao);
      prisma.notificacao.delete.mockResolvedValue({});

      await notificacaoController.delete(req, res);

      expect(prisma.notificacao.delete).toHaveBeenCalledWith({
        where: { id: 'notif-123' }
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notificação deletada com sucesso'
      });
    });

    it('deve retornar erro 404 se notificação não encontrada', async () => {
      req.params.id = 'notif-inexistente';

      prisma.notificacao.findUnique.mockResolvedValue(null);

      await notificacaoController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Notificação não encontrada' });
    });

    it('deve retornar erro 403 para notificação de outro usuário', async () => {
      req.params.id = 'notif-123';

      prisma.notificacao.findUnique.mockResolvedValue({
        id: 'notif-123',
        usuarioId: 'other-user'
      });

      await notificacaoController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado' });
    });
  });

  describe('deleteAllRead', () => {
    it('deve deletar todas notificações lidas do usuário', async () => {
      prisma.notificacao.deleteMany.mockResolvedValue({ count: 10 });

      await notificacaoController.deleteAllRead(req, res);

      expect(prisma.notificacao.deleteMany).toHaveBeenCalledWith({
        where: {
          usuarioId: 'user-123',
          lida: true
        }
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notificações lidas deletadas com sucesso',
        count: 10
      });
    });

    it('deve não deletar não lidas', async () => {
      prisma.notificacao.deleteMany.mockResolvedValue({ count: 5 });

      await notificacaoController.deleteAllRead(req, res);

      expect(prisma.notificacao.deleteMany).toHaveBeenCalledWith({
        where: {
          usuarioId: 'user-123',
          lida: true
        }
      });
    });
  });

  describe('create', () => {
    it('deve permitir admin criar notificação', async () => {
      req.userType = 'ADMIN';
      req.body = {
        usuarioId: 'user-456',
        tipo: 'INFORMACAO',
        titulo: 'Aviso Importante',
        mensagem: 'Esta é uma mensagem de teste'
      };

      const mockNotificacao = {
        id: 'notif-new',
        ...req.body
      };

      prisma.notificacao.create.mockResolvedValue(mockNotificacao);

      await notificacaoController.create(req, res);

      expect(prisma.notificacao.create).toHaveBeenCalledWith({
        data: req.body
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNotificacao);
    });

    it('deve retornar erro 403 se usuário não é admin', async () => {
      req.userType = 'VEREADOR';
      req.body = {
        usuarioId: 'user-456',
        tipo: 'INFORMACAO',
        titulo: 'Aviso',
        mensagem: 'Mensagem'
      };

      await notificacaoController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Apenas administradores podem criar notificações'
      });
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      req.userType = 'ADMIN';
      req.body = {
        usuarioId: 'user-456',
        tipo: 'INFORMACAO',
        titulo: 'Aviso',
        mensagem: 'Mensagem'
      };

      prisma.notificacao.create.mockRejectedValue(new Error('Database error'));

      await notificacaoController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar notificação' });
    });
  });
});
