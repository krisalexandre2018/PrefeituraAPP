const emailService = require('../../../src/services/email.service');
const nodemailer = require('nodemailer');
const prisma = require('../../../src/config/database');

// Mock do nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let sendMailMock;

  beforeEach(() => {
    sendMailMock = jest.fn().mockResolvedValue({
      messageId: 'test-message-id'
    });

    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock
    });
  });

  describe('notifyAdminNewUser', () => {
    it('deve enviar email para admin sobre novo usuário', async () => {
      const mockUser = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        cpf: '12345678901',
        telefone: '11999999999'
      };

      process.env.EMAIL_FROM = 'noreply@example.com';
      process.env.ADMIN_EMAIL = 'admin@example.com';

      await emailService.notifyAdminNewUser(mockUser);

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          to: 'admin@example.com',
          subject: expect.stringContaining('Novo Cadastro'),
          html: expect.stringContaining('João Silva')
        })
      );
    });

    it('não deve lançar erro se envio falhar', async () => {
      sendMailMock.mockRejectedValue(new Error('Email error'));

      const mockUser = {
        nome: 'João Silva',
        email: 'joao@example.com',
        cpf: '12345678901'
      };

      await expect(
        emailService.notifyAdminNewUser(mockUser)
      ).resolves.not.toThrow();
    });
  });

  describe('notifyJuridicoNewOcorrencia', () => {
    it('deve enviar email para equipe jurídica', async () => {
      const mockOcorrencia = {
        id: '1',
        titulo: 'Buraco na rua',
        descricao: 'Grande buraco',
        categoria: 'INFRAESTRUTURA',
        endereco: 'Rua Principal, 123',
        prioridade: 'ALTA',
        vereador: {
          nome: 'João Silva',
          email: 'joao@example.com'
        }
      };

      prisma.user.findMany.mockResolvedValue([
        { email: 'juridico1@example.com' },
        { email: 'juridico2@example.com' }
      ]);

      process.env.EMAIL_FROM = 'noreply@example.com';

      await emailService.notifyJuridicoNewOcorrencia(mockOcorrencia);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { tipo: 'JURIDICO', status: 'ATIVO' },
        select: { email: true }
      });

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'juridico1@example.com,juridico2@example.com',
          subject: expect.stringContaining('Buraco na rua'),
          html: expect.stringContaining('João Silva')
        })
      );
    });

    it('não deve enviar email se não houver jurídicos ativos', async () => {
      const mockOcorrencia = {
        titulo: 'Buraco na rua',
        vereador: { nome: 'João Silva' }
      };

      prisma.user.findMany.mockResolvedValue([]);

      await emailService.notifyJuridicoNewOcorrencia(mockOcorrencia);

      expect(sendMailMock).not.toHaveBeenCalled();
    });
  });

  describe('notifyUserApproved', () => {
    it('deve enviar email de aprovação para usuário', async () => {
      const mockUser = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com'
      };

      process.env.EMAIL_FROM = 'noreply@example.com';

      await emailService.notifyUserApproved(mockUser);

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'joao@example.com',
          subject: expect.stringContaining('Aprovado'),
          html: expect.stringContaining('João Silva')
        })
      );
    });
  });
});
