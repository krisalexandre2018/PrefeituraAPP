const request = require('supertest');
const express = require('express');
const ocorrenciaRoutes = require('../../src/routes/ocorrencia.routes');
const prisma = require('../../src/config/database');
const jwt = require('jsonwebtoken');

// Mock dos services
jest.mock('../../src/services/upload.service');
jest.mock('../../src/services/email.service');

const uploadService = require('../../src/services/upload.service');

const app = express();
app.use(express.json());
app.use('/api/ocorrencias', ocorrenciaRoutes);

describe('Ocorrencia Routes Integration', () => {
  let vereadorToken, juridicoToken, adminToken;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';

    vereadorToken = jwt.sign(
      { userId: '1', userType: 'VEREADOR' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    juridicoToken = jwt.sign(
      { userId: '2', userType: 'JURIDICO' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    adminToken = jwt.sign(
      { userId: '3', userType: 'ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ocorrencias', () => {
    it('deve criar ocorrência como vereador', async () => {
      const mockOcorrencia = {
        id: '1',
        titulo: 'Buraco na rua',
        descricao: 'Grande buraco',
        categoria: 'INFRAESTRUTURA',
        endereco: 'Rua Principal, 123',
        status: 'PENDENTE',
        vereadorId: '1',
        vereador: {
          nome: 'João Silva',
          email: 'joao@example.com'
        }
      };

      prisma.ocorrencia.create.mockResolvedValue(mockOcorrencia);
      prisma.historico.create.mockResolvedValue({});
      prisma.ocorrencia.findUnique.mockResolvedValue({
        ...mockOcorrencia,
        fotos: []
      });

      const response = await request(app)
        .post('/api/ocorrencias')
        .set('Authorization', `Bearer ${vereadorToken}`)
        .send({
          titulo: 'Buraco na rua',
          descricao: 'Grande buraco',
          categoria: 'INFRAESTRUTURA',
          endereco: 'Rua Principal, 123',
          prioridade: 'ALTA'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.titulo).toBe('Buraco na rua');
    });

    it('não deve permitir jurídico criar ocorrência', async () => {
      const response = await request(app)
        .post('/api/ocorrencias')
        .set('Authorization', `Bearer ${juridicoToken}`)
        .send({
          titulo: 'Buraco na rua',
          descricao: 'Descrição'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('vereadores');
    });

    it('deve exigir autenticação', async () => {
      const response = await request(app)
        .post('/api/ocorrencias')
        .send({
          titulo: 'Buraco na rua',
          descricao: 'Descrição'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/ocorrencias', () => {
    it('vereador deve ver apenas suas ocorrências', async () => {
      const mockOcorrencias = [
        { id: '1', titulo: 'Ocorrência 1', vereadorId: '1' },
        { id: '2', titulo: 'Ocorrência 2', vereadorId: '1' }
      ];

      prisma.ocorrencia.findMany.mockResolvedValue(mockOcorrencias);
      prisma.ocorrencia.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/ocorrencias')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ocorrencias');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.ocorrencias).toHaveLength(2);
    });

    it('jurídico deve ver todas ocorrências', async () => {
      const mockOcorrencias = [
        { id: '1', titulo: 'Ocorrência 1', vereadorId: '1' },
        { id: '2', titulo: 'Ocorrência 2', vereadorId: '2' },
        { id: '3', titulo: 'Ocorrência 3', vereadorId: '3' }
      ];

      prisma.ocorrencia.findMany.mockResolvedValue(mockOcorrencias);
      prisma.ocorrencia.count.mockResolvedValue(3);

      const response = await request(app)
        .get('/api/ocorrencias')
        .set('Authorization', `Bearer ${juridicoToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ocorrencias).toHaveLength(3);
    });

    it('deve suportar paginação', async () => {
      prisma.ocorrencia.findMany.mockResolvedValue([]);
      prisma.ocorrencia.count.mockResolvedValue(50);

      const response = await request(app)
        .get('/api/ocorrencias?page=2&limit=10')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBe(50);
      expect(response.body.pagination.pages).toBe(5);
    });

    it('deve filtrar por status', async () => {
      prisma.ocorrencia.findMany.mockResolvedValue([]);
      prisma.ocorrencia.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/ocorrencias?status=PENDENTE')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(200);
      expect(prisma.ocorrencia.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDENTE'
          })
        })
      );
    });

    it('deve filtrar por categoria', async () => {
      prisma.ocorrencia.findMany.mockResolvedValue([]);
      prisma.ocorrencia.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/ocorrencias?categoria=INFRAESTRUTURA')
        .set('Authorization', `Bearer ${juridicoToken}`);

      expect(response.status).toBe(200);
      expect(prisma.ocorrencia.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoria: 'INFRAESTRUTURA'
          })
        })
      );
    });
  });

  describe('GET /api/ocorrencias/:id', () => {
    it('deve retornar detalhes da ocorrência', async () => {
      const mockOcorrencia = {
        id: '1',
        titulo: 'Buraco na rua',
        vereadorId: '1',
        fotos: [],
        historicos: [],
        vereador: { nome: 'João Silva' }
      };

      prisma.ocorrencia.findUnique.mockResolvedValue(mockOcorrencia);

      const response = await request(app)
        .get('/api/ocorrencias/1')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('1');
      expect(response.body).toHaveProperty('historicos');
    });

    it('vereador não deve ver ocorrência de outro', async () => {
      prisma.ocorrencia.findUnique.mockResolvedValue({
        id: '1',
        vereadorId: '999' // Diferente do token
      });

      const response = await request(app)
        .get('/api/ocorrencias/1')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(403);
    });

    it('deve retornar 404 para ocorrência inexistente', async () => {
      prisma.ocorrencia.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/ocorrencias/999')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/ocorrencias/:id/status', () => {
    it('jurídico deve atualizar status', async () => {
      const mockOcorrencia = {
        id: '1',
        titulo: 'Buraco na rua',
        vereadorId: '1',
        vereador: { nome: 'João', email: 'joao@example.com' }
      };

      prisma.ocorrencia.findUnique.mockResolvedValue(mockOcorrencia);
      prisma.ocorrencia.update.mockResolvedValue({
        ...mockOcorrencia,
        status: 'EM_ANALISE'
      });
      prisma.historico.create.mockResolvedValue({});
      prisma.notificacao.create.mockResolvedValue({});

      const response = await request(app)
        .patch('/api/ocorrencias/1/status')
        .set('Authorization', `Bearer ${juridicoToken}`)
        .send({
          status: 'EM_ANALISE',
          comentario: 'Iniciando análise'
        });

      expect(response.status).toBe(200);
      expect(prisma.historico.create).toHaveBeenCalled();
      expect(prisma.notificacao.create).toHaveBeenCalled();
    });

    it('vereador não deve atualizar status', async () => {
      const response = await request(app)
        .patch('/api/ocorrencias/1/status')
        .set('Authorization', `Bearer ${vereadorToken}`)
        .send({
          status: 'EM_ANALISE'
        });

      expect(response.status).toBe(403);
    });

    it('admin deve atualizar status', async () => {
      const mockOcorrencia = {
        id: '1',
        vereadorId: '1',
        vereador: { nome: 'João', email: 'joao@example.com' }
      };

      prisma.ocorrencia.findUnique.mockResolvedValue(mockOcorrencia);
      prisma.ocorrencia.update.mockResolvedValue(mockOcorrencia);
      prisma.historico.create.mockResolvedValue({});
      prisma.notificacao.create.mockResolvedValue({});

      const response = await request(app)
        .patch('/api/ocorrencias/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'RESOLVIDO'
        });

      expect(response.status).toBe(200);
    });

    it('deve rejeitar status inválido', async () => {
      const response = await request(app)
        .patch('/api/ocorrencias/1/status')
        .set('Authorization', `Bearer ${juridicoToken}`)
        .send({
          status: 'STATUS_INVALIDO'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/ocorrencias/:id', () => {
    it('vereador deve deletar própria ocorrência pendente', async () => {
      prisma.ocorrencia.findUnique.mockResolvedValue({
        id: '1',
        vereadorId: '1',
        status: 'PENDENTE'
      });
      prisma.ocorrencia.delete.mockResolvedValue({});

      const response = await request(app)
        .delete('/api/ocorrencias/1')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deletada');
    });

    it('vereador não deve deletar ocorrência de outro', async () => {
      prisma.ocorrencia.findUnique.mockResolvedValue({
        id: '1',
        vereadorId: '999',
        status: 'PENDENTE'
      });

      const response = await request(app)
        .delete('/api/ocorrencias/1')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(403);
    });

    it('vereador não deve deletar ocorrência em análise', async () => {
      prisma.ocorrencia.findUnique.mockResolvedValue({
        id: '1',
        vereadorId: '1',
        status: 'EM_ANALISE'
      });

      const response = await request(app)
        .delete('/api/ocorrencias/1')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('pendentes');
    });
  });

  describe('GET /api/ocorrencias/stats', () => {
    it('jurídico deve obter estatísticas', async () => {
      prisma.ocorrencia.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(20);

      prisma.ocorrencia.groupBy.mockResolvedValue([
        { categoria: 'INFRAESTRUTURA', _count: 40 }
      ]);

      const response = await request(app)
        .get('/api/ocorrencias/stats')
        .set('Authorization', `Bearer ${juridicoToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pendentes');
      expect(response.body).toHaveProperty('porCategoria');
    });

    it('vereador não deve acessar estatísticas', async () => {
      const response = await request(app)
        .get('/api/ocorrencias/stats')
        .set('Authorization', `Bearer ${vereadorToken}`);

      expect(response.status).toBe(403);
    });

    it('admin deve obter estatísticas', async () => {
      prisma.ocorrencia.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(20);

      prisma.ocorrencia.groupBy.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/ocorrencias/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });
});
