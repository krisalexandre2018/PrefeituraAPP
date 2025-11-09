// Mock do Prisma Client para testes de integração

class PrismaClientMock {
  constructor() {
    this.user = {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    this.ocorrencia = {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn()
    };

    this.foto = {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    };

    this.historico = {
      create: jest.fn(),
      findMany: jest.fn()
    };

    this.notificacao = {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn()
    };
  }

  $connect() {
    return Promise.resolve();
  }

  $disconnect() {
    return Promise.resolve();
  }

  $transaction(callback) {
    return callback(this);
  }
}

module.exports = new PrismaClientMock();
