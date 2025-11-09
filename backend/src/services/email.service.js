const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async notifyAdminNewUser(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: 'Novo Cadastro de Vereador - Aprovação Pendente',
        html: `
          <h2>Novo Cadastro Pendente</h2>
          <p>Um novo vereador solicitou cadastro no sistema:</p>
          <ul>
            <li><strong>Nome:</strong> ${user.nome}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>CPF:</strong> ${user.cpf}</li>
            <li><strong>Telefone:</strong> ${user.telefone || 'Não informado'}</li>
          </ul>
          <p>Acesse o painel administrativo para aprovar ou rejeitar este cadastro.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email enviado para admin sobre novo usuário');
    } catch (error) {
      console.error('Erro ao enviar email para admin:', error);
    }
  }

  async notifyJuridicoNewOcorrencia(ocorrencia) {
    try {
      // Buscar emails da equipe jurídica
      const prisma = require('../config/database');
      const juridicos = await prisma.user.findMany({
        where: { tipo: 'JURIDICO', status: 'ATIVO' },
        select: { email: true }
      });

      if (juridicos.length === 0) {
        console.log('Nenhum usuário jurídico ativo encontrado');
        return;
      }

      const emails = juridicos.map(j => j.email);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: emails.join(','),
        subject: `Nova Ocorrência: ${ocorrencia.titulo}`,
        html: `
          <h2>Nova Ocorrência Registrada</h2>
          <p>Uma nova ocorrência foi registrada no sistema:</p>
          <ul>
            <li><strong>Título:</strong> ${ocorrencia.titulo}</li>
            <li><strong>Vereador:</strong> ${ocorrencia.vereador.nome}</li>
            <li><strong>Categoria:</strong> ${ocorrencia.categoria}</li>
            <li><strong>Endereço:</strong> ${ocorrencia.endereco}</li>
            <li><strong>Prioridade:</strong> ${ocorrencia.prioridade}</li>
          </ul>
          <p><strong>Descrição:</strong></p>
          <p>${ocorrencia.descricao}</p>
          <p>Acesse o sistema para mais detalhes.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email enviado para equipe jurídica');
    } catch (error) {
      console.error('Erro ao enviar email para jurídico:', error);
    }
  }

  async notifyUserApproved(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Cadastro Aprovado - Sistema de Ocorrências',
        html: `
          <h2>Bem-vindo ao Sistema!</h2>
          <p>Olá ${user.nome},</p>
          <p>Seu cadastro foi aprovado pelo administrador.</p>
          <p>Agora você pode fazer login no aplicativo com suas credenciais.</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p>Em caso de dúvidas, entre em contato com o suporte.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email de aprovação enviado para usuário');
    } catch (error) {
      console.error('Erro ao enviar email de aprovação:', error);
    }
  }

  async sendPasswordResetEmail(email, token) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Recuperação de Senha - Sistema de Ocorrências',
        html: `
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a recuperação de senha.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Resetar Senha</a></p>
          <p>Ou copie e cole este link no navegador:</p>
          <p>${resetUrl}</p>
          <p><strong>Este link expira em 1 hora.</strong></p>
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email de recuperação de senha enviado');
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
