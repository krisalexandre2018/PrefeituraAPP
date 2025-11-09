const ocorrenciaController = require('../../../src/controllers/ocorrencia.controller');
const prisma = require('../../../src/config/database');
const uploadService = require('../../../src/services/upload.service');
const emailService = require('../../../src/services/email.service');

// Mock dos services
jest.mock('../../../src/services/upload.service');
jest.mock('../../../src/services/email.service');

describe('OcorrenciaController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      userId: '1',
      userType: 'VEREADOR',
      files: []
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('create', () => {
    it('deve criar uma ocorrência sem fotos', async () => {
      req.body = {
        titulo: 'Buraco na rua',
        descricao: 'Grande buraco na rua principal',
        categoria: 'INFRAESTRUTURA',
        endereco: 'Rua Principal, 123',
        latitude: '-23.550520',
        longitude: '-46.633309',
        prioridade: 'ALTA'
      };

      const mockOcorrencia = {
        id: '1',
        titulo: 'Buraco na rua',
        descricao: 'Grande buraco na rua principal',
        categoria: 'INFRAESTRUTURA',
        endereco: 'Rua Principal, 123',
        latitude: -23.550520,
        longitude: -46.633309,
        prioridade: 'ALTA',
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
      emailService.notifyJuridicoNewOcorrencia = jest.fn().mockResolvedValue(true);

      await ocorrenciaController.create(req, res);

      expect(prisma.ocorrencia.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          titulo: 'Buraco na rua',
          categoria: 'INFRAESTRUTURA',
          vereadorId: '1'
        }),
        include: expect.any(Object)
      });
      expect(prisma.historico.create).toHaveBeenCalled();
      expect(emailService.notifyJuridicoNewOcorrencia).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar erro se não for vereador', async () => {
      req.userType = 'JURIDICO';
      req.body = {
        titulo: 'Buraco na rua',
        descricao: 'Descrição'
      };

      await ocorrenciaController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Apenas vereadores podem criar ocorrências'
      });
    });

    it('deve fazer upload de fotos ao criar ocorrência', async () => {
      req.body = {
        titulo: 'Buraco na rua',
        descricao: 'Grande buraco',
        endereco: 'Rua Principal, 123'
      };

      req.files = [
        { buffer: Buffer.from('fake-image-1'), mimetype: 'image/jpeg' },
        { buffer: Buffer.from('fake-image-2'), mimetype: 'image/jpeg' }
      ];

      const mockOcorrencia = {
        id: '1',
        titulo: 'Buraco na rua',
        vereadorId: '1',
        vereador: { nome: 'João Silva', email: 'joao@example.com' }
      };

      uploadService.uploadImage.mockResolvedValue({
        url: 'https://cloudinary.com/image.jpg',
        thumbnail: 'https://cloudinary.com/thumb.jpg',
        publicId: 'test-id'
      });

      prisma.ocorrencia.create.mockResolvedValue(mockOcorrencia);
      prisma.foto.create.mockResolvedValue({});
      prisma.historico.create.mockResolvedValue({});
      prisma.ocorrencia.findUnique.mockResolvedValue({
        ...mockOcorrencia,
        fotos: []
      });
      emailService.notifyJuridicoNewOcorrencia = jest.fn().mockResolvedValue(true);

      await ocorrenciaController.create(req, res);

      expect(uploadService.uploadImage).toHaveBeenCalledTimes(2);
      expect(prisma.foto.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('list', () => {
    it('deve listar apenas ocorrências do vereador logado', async () => {
      req.query = { page: 1, limit: 10 };
      req.userType = 'VEREADOR';
      req.userId = '1';

      const mockOcorrencias = [
        { id: '1', titulo: 'Ocorrência 1', vereadorId: '1' },
        { id: '2', titulo: 'Ocorrência 2', vereadorId: '1' }
      ];

      prisma.ocorrencia.findMany.mockResolvedValue(mockOcorrencias);
      prisma.ocorrencia.count.mockResolvedValue(2);

      await ocorrenciaController.list(req, res);

      expect(prisma.ocorrencia.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { vereadorId: '1' }
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        ocorrencias: mockOcorrencias,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      });
    });

    it('deve listar todas ocorrências para jurídico', async () => {
      req.query = { page: 1, limit: 10 };
      req.userType = 'JURIDICO';

      const mockOcorrencias = [
        { id: '1', titulo: 'Ocorrência 1', vereadorId: '1' },
        { id: '2', titulo: 'Ocorrência 2', vereadorId: '2' }
      ];

      prisma.ocorrencia.findMany.mockResolvedValue(mockOcorrencias);
      prisma.ocorrencia.count.mockResolvedValue(2);

      await ocorrenciaController.list(req, res);

      expect(prisma.ocorrencia.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}
        })
      );
    });

    it('deve filtrar por status e categoria', async () => {
      req.query = {
        status: 'PENDENTE',
        categoria: 'INFRAESTRUTURA',
        page: 1,
        limit: 10
      };
      req.userType = 'ADMIN';

      prisma.ocorrencia.findMany.mockResolvedValue([]);
      prisma.ocorrencia.count.mockResolvedValue(0);

      await ocorrenciaController.list(req, res);

      expect(prisma.ocorrencia.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'PENDENTE',
            categoria: 'INFRAESTRUTURA'
          }
        })
      );
    });
  });

  describe('getById', () => {
    it('deve retornar detalhes da ocorrência', async () => {
      req.params.id = '1';
      req.userId = '1';
      req.userType = 'VEREADOR';

      const mockOcorrencia = {
        id: '1',
        titulo: 'Buraco na rua',
        vereadorId: '1',
        fotos: [],
        vereador: { nome: 'João Silva' },
        historicos: []
      };

      prisma.ocorrencia.findUnique.mockResolvedValue(mockOcorrencia);

      await ocorrenciaController.getById(req, res);

      expect(prisma.ocorrencia.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object)
      });
      expect(res.json).toHaveBeenCalledWith(mockOcorrencia);
    });

    it('deve negar acesso a ocorrência de outro vereador', async () => {
      req.params.id = '1';
      req.userId = '2';
      req.userType = 'VEREADOR';

      prisma.ocorrencia.findUnique.mockResolvedValue({
        id: '1',
        vereadorId: '1'
      });

      await ocorrenciaController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado' });
    });

    it('deve retornar 404 se ocorrência não existir', async () => {
      req.params.id = '999';
      prisma.ocorrencia.findUnique.mockResolvedValue(null);

      await ocorrenciaController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Ocorrência não encontrada' });
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar status da ocorrência', async () => {
      req.params.id = '1';
      req.body = {
        status: 'EM_ANALISE',
        comentario: 'Iniciando análise'
      };
      req.userId = '2';
      req.userType = 'JURIDICO';

      const mockOcorrencia = {
        id: '1',
        titulo: 'Buraco na rua',
        vereadorId: '1',
        vereador: { nome: 'João Silva', email: 'joao@example.com' }
      };

      prisma.ocorrencia.findUnique.mockResolvedValue(mockOcorrencia);
      prisma.ocorrencia.update.mockResolvedValue({
        ...mockOcorrencia,
        status: 'EM_ANALISE'
      });
      prisma.historico.create.mockResolvedValue({});
      prisma.notificacao.create.mockResolvedValue({});

      await ocorrenciaController.updateStatus(req, res);

      expect(prisma.ocorrencia.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'EM_ANALISE' }
      });
      expect(prisma.historico.create).toHaveBeenCalled();
      expect(prisma.notificacao.create).toHaveBeenCalled();
    });

    it('deve retornar erro para status inválido', async () => {
      req.params.id = '1';
      req.body = { status: 'STATUS_INVALIDO' };

      await ocorrenciaController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Status inválido' });
    });
  });

  describe('delete', () => {
    it('deve deletar ocorrência pendente do próprio vereador', async () => {
      req.params.id = '1';
      req.userId = '1';
      req.userType = 'VEREADOR';

      prisma.ocorrencia.findUnique.mockResolvedValue({
        id: '1',
        vereadorId: '1',
        status: 'PENDENTE'
      });
      prisma.ocorrencia.delete.mockResolvedValue({});

      await ocorrenciaController.delete(req, res);

      expect(prisma.ocorrencia.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Ocorrência deletada com sucesso' });
    });

    it('deve negar deleção de ocorrência de outro vereador', async () => {
      req.params.id = '1';
      req.userId = '2';
      req.userType = 'VEREADOR';

      prisma.ocorrencia.findUnique.mockResolvedValue({
        id: '1',
        vereadorId: '1',
        status: 'PENDENTE'
      });

      await ocorrenciaController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado' });
    });

    it('deve negar deleção de ocorrência não pendente', async () => {
      req.params.id = '1';
      req.userId = '1';
      req.userType = 'VEREADOR';

      prisma.ocorrencia.findUnique.mockResolvedValue({
        id: '1',
        vereadorId: '1',
        status: 'EM_ANALISE'
      });

      await ocorrenciaController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Apenas ocorrências pendentes podem ser deletadas'
      });
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas das ocorrências', async () => {
      prisma.ocorrencia.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(20);

      prisma.ocorrencia.groupBy.mockResolvedValue([
        { categoria: 'INFRAESTRUTURA', _count: 40 },
        { categoria: 'ILUMINACAO', _count: 30 },
        { categoria: 'LIMPEZA', _count: 30 }
      ]);

      await ocorrenciaController.getStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        total: 100,
        pendentes: 30,
        emAnalise: 50,
        resolvidas: 20,
        porCategoria: expect.any(Array)
      });
    });
  });
});
