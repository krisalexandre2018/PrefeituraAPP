// Configuração global dos testes

// Aumentar timeout para testes de integração
jest.setTimeout(10000);

// Mock de variáveis de ambiente
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '2h';
process.env.NODE_ENV = 'test';

// Mock do Prisma Client para testes unitários
jest.mock('../src/config/database', () => {
  return {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    ocorrencia: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    },
    foto: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn()
    },
    historico: {
      create: jest.fn(),
      findMany: jest.fn()
    },
    notificacao: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    $transaction: jest.fn(callback => callback({
      ocorrencia: {
        create: jest.fn(),
        findUnique: jest.fn()
      },
      foto: {
        createMany: jest.fn()
      },
      historico: {
        create: jest.fn()
      }
    }))
  };
});

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
