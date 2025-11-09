const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth.routes');
const prisma = require('../../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock do email service
jest.mock('../../src/services/email.service');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar novo vereador com sucesso', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        telefone: '11999999999',
        tipo: 'VEREADOR',
        status: 'PENDENTE',
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'João Silva',
          cpf: '12345678901',
          email: 'joao@example.com',
          senha: 'senha123',
          telefone: '11999999999'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.status).toBe('PENDENTE');
    });

    it('deve retornar erro para dados inválidos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'João Silva',
          cpf: '123', // CPF inválido
          email: 'email-invalido',
          senha: '12' // Senha muito curta
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('deve retornar erro para email duplicado', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'joao@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'João Silva',
          cpf: '12345678901',
          email: 'joao@example.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('CPF ou email já cadastrado');
    });

    it('deve validar campos obrigatórios', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);

      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: hashedPassword,
        tipo: 'VEREADOR',
        status: 'ATIVO',
        fotoPerfil: null
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@example.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('joao@example.com');
    });

    it('deve retornar erro para credenciais inválidas', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@example.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciais inválidas');
    });

    it('deve retornar erro para senha incorreta', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);

      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'joao@example.com',
        senha: hashedPassword,
        status: 'ATIVO'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@example.com',
          senha: 'senhaerrada'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciais inválidas');
    });

    it('deve retornar erro para conta pendente', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);

      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'joao@example.com',
        senha: hashedPassword,
        status: 'PENDENTE'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@example.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('aprovação');
    });

    it('deve retornar erro para conta inativa', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);

      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'joao@example.com',
        senha: hashedPassword,
        status: 'INATIVO'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joao@example.com',
          senha: 'senha123'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('desativada');
    });

    it('deve validar formato do email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'email-invalido',
          senha: 'senha123'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      const token = jwt.sign(
        { userId: '1', userType: 'VEREADOR' },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        cpf: '12345678901',
        telefone: '11999999999',
        tipo: 'VEREADOR',
        status: 'ATIVO',
        fotoPerfil: null,
        createdAt: new Date()
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nome');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('senha');
    });

    it('deve retornar erro sem token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token não fornecido');
    });

    it('deve retornar erro com token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido');

      expect(response.status).toBe(401);
    });

    it('deve retornar 404 se usuário não existir', async () => {
      const token = jwt.sign(
        { userId: '999', userType: 'VEREADOR' },
        process.env.JWT_SECRET
      );

      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
