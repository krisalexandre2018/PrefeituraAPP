const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Registro
router.post('/register', [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('cpf').trim().isLength({ min: 11, max: 11 }).withMessage('CPF inválido').matches(/^\d{11}$/).withMessage('CPF deve conter apenas números'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('telefone').optional().trim()
], authController.register);

// Login
router.post('/login', [
  body('email').trim().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], authController.login);

// Obter dados do usuário logado
router.get('/me', authMiddleware, authController.me);

// Atualizar perfil
router.patch('/profile', authMiddleware, [
  body('nome').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().trim().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('telefone').optional().trim()
], authController.updateProfile);

// Alterar senha
router.patch('/change-password', authMiddleware, [
  body('senhaAtual').notEmpty().withMessage('Senha atual é obrigatória'),
  body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
], authController.changePassword);

// Solicitar recuperação de senha
router.post('/forgot-password', [
  body('email').trim().isEmail().normalizeEmail().withMessage('Email inválido')
], authController.forgotPassword);

// Resetar senha com token
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token é obrigatório'),
  body('novaSenha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
], authController.resetPassword);

module.exports = router;
