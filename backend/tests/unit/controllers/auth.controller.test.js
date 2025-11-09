const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../../../src/controllers/auth.controller');
const prisma = require('../../../src/config/database');
const emailService = require('../../../src/services/email.service');

// Mock do email service
jest.mock('../../../src/services/email.service', () => ({
  notifyAdminNewUser: jest.fn().mockResolvedValue(true),
  notifyUserApproved: jest.fn().mockResolvedValue(true)
}));

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      userId: null,
      userType: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      req.body = {
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        senha: 'senha123',
        telefone: '11999999999'
      };

      const mockValidationResult = {
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      };

      jest.mock('express-validator', () => ({
        validationResult: jest.fn().mockReturnValue(mockValidationResult)
      }));

      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        telefone: '11999999999',
        tipo: 'VEREADOR',
        status: 'PENDENTE'
      });

      await authController.register(req, res);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'joao@example.com' }, { cpf: '12345678901' }]
        }
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(emailService.notifyAdminNewUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Cadastro realizado'),
          user: expect.objectContaining({
            email: 'joao@example.com',
            status: 'PENDENTE'
          })
        })
      );
    });

    it('deve retornar erro se email/CPF já existir', async () => {
      req.body = {
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        senha: 'senha123'
      };

      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'joao@example.com'
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'CPF ou email já cadastrado'
      });
    });
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      req.body = {
        email: 'joao@example.com',
        senha: 'senha123'
      };

      const hashedPassword = await bcrypt.hash('senha123', 10);
      const mockUser = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: hashedPassword,
        tipo: 'VEREADOR',
        status: 'ATIVO',
        fotoPerfil: null
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await authController.login(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'joao@example.com' }
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            id: '1',
            email: 'joao@example.com'
          })
        })
      );
    });

    it('deve retornar erro para credenciais inválidas', async () => {
      req.body = {
        email: 'joao@example.com',
        senha: 'senhaerrada'
      };

      prisma.user.findUnique.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Credenciais inválidas'
      });
    });

    it('deve retornar erro para conta pendente', async () => {
      req.body = {
        email: 'joao@example.com',
        senha: 'senha123'
      };

      const hashedPassword = await bcrypt.hash('senha123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'joao@example.com',
        senha: hashedPassword,
        status: 'PENDENTE'
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Conta aguardando aprovação do administrador'
      });
    });

    it('deve retornar erro para conta inativa', async () => {
      req.body = {
        email: 'joao@example.com',
        senha: 'senha123'
      };

      const hashedPassword = await bcrypt.hash('senha123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'joao@example.com',
        senha: hashedPassword,
        status: 'INATIVO'
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Conta desativada. Entre em contato com o administrador'
      });
    });
  });

  describe('me', () => {
    it('deve retornar dados do usuário logado', async () => {
      req.userId = '1';

      const mockUser = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        cpf: '12345678901',
        telefone: '11999999999',
        tipo: 'VEREADOR',
        status: 'ATIVO',
        fotoPerfil: null,
        createdAt: new Date()
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await authController.me(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object)
      });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('deve retornar erro se usuário não encontrado', async () => {
      req.userId = '999';
      prisma.user.findUnique.mockResolvedValue(null);

      await authController.me(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado'
      });
    });
  });
});
