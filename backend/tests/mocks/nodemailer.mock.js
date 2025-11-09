// Mock do Nodemailer para testes

const sendMailMock = jest.fn().mockResolvedValue({
  messageId: 'test-message-id',
  accepted: ['test@example.com'],
  rejected: [],
  response: '250 Message accepted'
});

const createTransportMock = jest.fn().mockReturnValue({
  sendMail: sendMailMock
});

module.exports = {
  createTransport: createTransportMock,
  sendMailMock // Exportar para usar em asserções
};
