const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const emailService = require('../services/email.service');

class AuthController {
  // Registro de novo usuário (vereador)
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { nome, cpf, email, senha, telefone } = req.body;

      // Verificar se já existe
      const userExists = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { cpf }]
        }
      });

      if (userExists) {
        return res.status(400).json({ error: 'CPF ou email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          nome,
          cpf,
          email,
          senha: hashedPassword,
          telefone,
          tipo: 'VEREADOR',
          status: 'PENDENTE' // Aguarda aprovação do admin
        }
      });

      // Notificar admin
      await emailService.notifyAdminNewUser(user);

      res.status(201).json({
        message: 'Cadastro realizado! Aguarde a aprovação do administrador.',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao realizar cadastro' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar status
      if (user.status === 'PENDENTE') {
        return res.status(403).json({ error: 'Conta aguardando aprovação do administrador' });
      }

      if (user.status === 'INATIVO') {
        return res.status(403).json({ error: 'Conta desativada. Entre em contato com o administrador' });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(senha, user.senha);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign(
        { userId: user.id, userType: user.tipo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          telefone: user.telefone,
          tipo: user.tipo,
          status: user.status,
          isSuperAdmin: user.isSuperAdmin,
          fotoPerfil: user.fotoPerfil,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao realizar login' });
    }
  }

  // Obter dados do usuário logado
  async me(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          tipo: true,
          status: true,
          isSuperAdmin: true,
          fotoPerfil: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
  }

  // Solicitar recuperação de senha
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Por segurança, não revelar se o email existe
        return res.json({ message: 'Se o email existir, um link de recuperação será enviado' });
      }

      // Gerar token único
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Expirar em 1 hora
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Salvar token
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt
        }
      });

      // Enviar email com link de recuperação
      await emailService.sendPasswordResetEmail(user.email, resetToken);

      res.json({ message: 'Se o email existir, um link de recuperação será enviado' });
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
  }

  // Resetar senha com token
  async resetPassword(req, res) {
    try {
      const { token, novaSenha } = req.body;

      // Hash do token recebido
      const crypto = require('crypto');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Buscar token válido
      const resetRecord = await prisma.passwordReset.findFirst({
        where: {
          token: hashedToken,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (!resetRecord) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(novaSenha, 10);

      // Atualizar senha
      await prisma.user.update({
        where: { id: resetRecord.userId },
        data: { senha: hashedPassword }
      });

      // Deletar token usado
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id }
      });

      // Deletar outros tokens do mesmo usuário
      await prisma.passwordReset.deleteMany({
        where: { userId: resetRecord.userId }
      });

      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      res.status(500).json({ error: 'Erro ao resetar senha' });
    }
  }

  // Atualizar perfil do usuário logado
  async updateProfile(req, res) {
    try {
      const { nome, telefone, email } = req.body;

      // Verificar se email já está em uso por outro usuário
      if (email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: req.userId }
          }
        });

        if (emailExists) {
          return res.status(400).json({ error: 'Email já está em uso' });
        }
      }

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: {
          ...(nome && { nome }),
          ...(telefone && { telefone }),
          ...(email && { email })
        },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          tipo: true,
          fotoPerfil: true
        }
      });

      res.json(user);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }

  // Alterar senha
  async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.userId }
      });

      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(senhaAtual, user.senha);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(novaSenha, 10);

      await prisma.user.update({
        where: { id: req.userId },
        data: { senha: hashedPassword }
      });

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }
}

module.exports = new AuthController();
