const userController = require('../../../src/controllers/user.controller');
const prisma = require('../../../src/config/database');
const emailService = require('../../../src/services/email.service');
const uploadService = require('../../../src/services/upload.service');

// Mock dos services
jest.mock('../../../src/services/email.service');
jest.mock('../../../src/services/upload.service');

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      userId: 'admin-id-123',
      userType: 'ADMIN',
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('list', () => {
    it('deve listar usuários com paginação', async () => {
      req.query = { page: 1, limit: 10 };

      const mockUsers = [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@example.com',
          cpf: '12345678901',
          tipo: 'VEREADOR',
          status: 'ATIVO'
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@example.com',
          cpf: '98765432100',
          tipo: 'JURIDICO',
          status: 'ATIVO'
        }
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(2);

      await userController.list(req, res);

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(prisma.user.count).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      });
    });

    it('deve filtrar por tipo', async () => {
      req.query = { tipo: 'VEREADOR', page: 1, limit: 10 };

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await userController.list(req, res);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tipo: 'VEREADOR' }
        })
      );
    });

    it('deve filtrar por status', async () => {
      req.query = { status: 'PENDENTE', page: 1, limit: 10 };

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await userController.list(req, res);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDENTE' }
        })
      );
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('Database error'));

      await userController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar usuários' });
    });
  });

  describe('listPending', () => {
    it('deve listar apenas usuários pendentes', async () => {
      const mockPendingUsers = [
        {
          id: '1',
          nome: 'Pedro Silva',
          email: 'pedro@example.com',
          status: 'PENDENTE',
          createdAt: new Date()
        }
      ];

      prisma.user.findMany.mockResolvedValue(mockPendingUsers);

      await userController.listPending(req, res);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDENTE' },
          orderBy: { createdAt: 'asc' }
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockPendingUsers);
    });

    it('deve retornar array vazio se não houver pendentes', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await userController.listPending(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('Database error'));

      await userController.listPending(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar usuários' });
    });
  });

  describe('getById', () => {
    it('deve retornar usuário com contagens', async () => {
      req.params.id = 'user-123';

      const mockUser = {
        id: 'user-123',
        nome: 'João Silva',
        email: 'joao@example.com',
        _count: {
          ocorrencias: 5,
          notificacoes: 10
        }
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await userController.getById(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' }
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('deve retornar erro 404 se usuário não encontrado', async () => {
      req.params.id = 'user-inexistente';

      prisma.user.findUnique.mockResolvedValue(null);

      await userController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      req.params.id = 'user-123';

      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await userController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar usuário' });
    });
  });

  describe('approve', () => {
    it('deve aprovar usuário pendente', async () => {
      req.params.id = 'user-123';
      req.body = { tipo: 'VEREADOR' };

      const mockUser = {
        id: 'user-123',
        nome: 'João Silva',
        email: 'joao@example.com',
        status: 'PENDENTE',
        tipo: 'VEREADOR'
      };

      const mockUpdatedUser = {
        ...mockUser,
        status: 'ATIVO'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUpdatedUser);
      prisma.notificacao.create.mockResolvedValue({});
      emailService.notifyUserApproved.mockResolvedValue(true);

      await userController.approve(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { status: 'ATIVO', tipo: 'VEREADOR' },
        select: expect.any(Object)
      });
      expect(emailService.notifyUserApproved).toHaveBeenCalled();
      expect(prisma.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          usuarioId: 'user-123',
          tipo: 'APROVACAO',
          titulo: 'Cadastro Aprovado'
        })
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuário aprovado com sucesso'
        })
      );
    });

    it('deve retornar erro 404 se usuário não encontrado', async () => {
      req.params.id = 'user-inexistente';

      prisma.user.findUnique.mockResolvedValue(null);

      await userController.approve(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    it('deve retornar erro se usuário não está pendente', async () => {
      req.params.id = 'user-123';

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        status: 'ATIVO'
      });

      await userController.approve(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuário não está pendente de aprovação'
      });
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      req.params.id = 'user-123';

      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await userController.approve(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao aprovar usuário' });
    });
  });

  describe('deactivate', () => {
    it('deve desativar usuário', async () => {
      req.params.id = 'user-123';
      req.body = { motivo: 'Violação de termos' };

      const mockUser = {
        id: 'user-123',
        nome: 'João Silva',
        status: 'ATIVO'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, status: 'INATIVO' });
      prisma.notificacao.create.mockResolvedValue({});

      await userController.deactivate(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { status: 'INATIVO' },
        select: expect.any(Object)
      });
      expect(prisma.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          usuarioId: 'user-123',
          tipo: 'DESATIVACAO',
          mensagem: expect.stringContaining('Violação de termos')
        })
      });
    });

    it('deve retornar erro ao tentar desativar própria conta', async () => {
      req.params.id = 'admin-id-123'; // Mesmo ID do req.userId

      await userController.deactivate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Você não pode desativar sua própria conta'
      });
    });

    it('deve retornar erro 404 se usuário não encontrado', async () => {
      req.params.id = 'user-inexistente';

      prisma.user.findUnique.mockResolvedValue(null);

      await userController.deactivate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });
  });

  describe('reactivate', () => {
    it('deve reativar usuário inativo', async () => {
      req.params.id = 'user-123';

      const mockUser = {
        id: 'user-123',
        nome: 'João Silva',
        status: 'INATIVO'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, status: 'ATIVO' });
      prisma.notificacao.create.mockResolvedValue({});

      await userController.reactivate(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { status: 'ATIVO' },
        select: expect.any(Object)
      });
      expect(prisma.notificacao.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          usuarioId: 'user-123',
          tipo: 'REATIVACAO'
        })
      });
    });

    it('deve retornar erro se usuário não está inativo', async () => {
      req.params.id = 'user-123';

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        status: 'ATIVO'
      });

      await userController.reactivate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuário não está inativo'
      });
    });
  });

  describe('updateType', () => {
    it('deve atualizar tipo de usuário', async () => {
      req.params.id = 'user-123';
      req.body = { tipo: 'JURIDICO' };

      const mockUser = {
        id: 'user-123',
        nome: 'João Silva',
        tipo: 'VEREADOR'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, tipo: 'JURIDICO' });
      prisma.notificacao.create.mockResolvedValue({});

      await userController.updateType(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { tipo: 'JURIDICO' },
        select: expect.any(Object)
      });
      expect(prisma.notificacao.create).toHaveBeenCalled();
    });

    it('deve retornar erro ao tentar alterar tipo da própria conta', async () => {
      req.params.id = 'admin-id-123';
      req.body = { tipo: 'VEREADOR' };

      await userController.updateType(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Você não pode alterar o tipo da sua própria conta'
      });
    });
  });

  describe('uploadProfilePicture', () => {
    it('deve fazer upload de nova foto de perfil', async () => {
      req.file = {
        buffer: Buffer.from('fake-image'),
        mimetype: 'image/jpeg'
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'admin-id-123',
        fotoPerfil: null
      });

      uploadService.uploadImage.mockResolvedValue({
        url: 'https://cloudinary.com/new-photo.jpg',
        publicId: 'perfil/photo123'
      });

      prisma.user.update.mockResolvedValue({
        id: 'admin-id-123',
        nome: 'Admin',
        email: 'admin@example.com',
        fotoPerfil: 'https://cloudinary.com/new-photo.jpg'
      });

      await userController.uploadProfilePicture(req, res);

      expect(uploadService.uploadImage).toHaveBeenCalledWith(req.file);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'admin-id-123' },
        data: { fotoPerfil: 'https://cloudinary.com/new-photo.jpg' },
        select: expect.any(Object)
      });
    });

    it('deve deletar foto antiga antes de fazer upload da nova', async () => {
      req.file = {
        buffer: Buffer.from('fake-image'),
        mimetype: 'image/jpeg'
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'admin-id-123',
        fotoPerfil: 'https://cloudinary.com/old-photo.jpg'
      });

      uploadService.uploadImage.mockResolvedValue({
        url: 'https://cloudinary.com/new-photo.jpg',
        publicId: 'perfil/photo123'
      });

      uploadService.deleteImage.mockResolvedValue(true);

      prisma.user.update.mockResolvedValue({
        id: 'admin-id-123',
        fotoPerfil: 'https://cloudinary.com/new-photo.jpg'
      });

      await userController.uploadProfilePicture(req, res);

      expect(uploadService.deleteImage).toHaveBeenCalled();
      expect(uploadService.uploadImage).toHaveBeenCalled();
    });

    it('deve retornar erro se nenhuma imagem fornecida', async () => {
      req.file = null;

      await userController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nenhuma imagem fornecida' });
    });
  });

  describe('delete', () => {
    it('deve deletar usuário sem ocorrências', async () => {
      req.params.id = 'user-123';

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        nome: 'João Silva',
        _count: { ocorrencias: 0 }
      });

      prisma.user.delete.mockResolvedValue({});

      await userController.delete(req, res);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' }
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário deletado com sucesso'
      });
    });

    it('deve retornar erro ao tentar deletar própria conta', async () => {
      req.params.id = 'admin-id-123';

      await userController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Você não pode deletar sua própria conta'
      });
    });

    it('deve retornar erro se usuário possui ocorrências', async () => {
      req.params.id = 'user-123';

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        _count: { ocorrencias: 5 }
      });

      await userController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuário possui 5 ocorrências. Desative a conta ao invés de deletar.'
      });
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas de usuários', async () => {
      prisma.user.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(40) // ativos
        .mockResolvedValueOnce(5)  // pendentes
        .mockResolvedValueOnce(5); // inativos

      prisma.user.groupBy.mockResolvedValue([
        { tipo: 'ADMIN', _count: { tipo: 2 } },
        { tipo: 'VEREADOR', _count: { tipo: 30 } },
        { tipo: 'JURIDICO', _count: { tipo: 18 } }
      ]);

      await userController.getStats(req, res);

      expect(prisma.user.count).toHaveBeenCalledTimes(4);
      expect(prisma.user.groupBy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        total: 50,
        ativos: 40,
        pendentes: 5,
        inativos: 5,
        porTipo: [
          { tipo: 'ADMIN', _count: { tipo: 2 } },
          { tipo: 'VEREADOR', _count: { tipo: 30 } },
          { tipo: 'JURIDICO', _count: { tipo: 18 } }
        ]
      });
    });

    it('deve retornar erro 500 em caso de exceção', async () => {
      prisma.user.count.mockRejectedValue(new Error('Database error'));

      await userController.getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar estatísticas' });
    });
  });
});
