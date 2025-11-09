const express = require('express');
const { body } = require('express-validator');
const notificacaoController = require('../controllers/notificacao.controller');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar notificações do usuário logado
router.get('/', notificacaoController.list);

// Contar notificações não lidas
router.get('/unread-count', notificacaoController.countUnread);

// Marcar todas como lidas
router.patch('/read-all', notificacaoController.markAllAsRead);

// Deletar todas as notificações lidas
router.delete('/read-all', notificacaoController.deleteAllRead);

// Criar notificação (apenas admin)
router.post('/', isAdmin, [
  body('usuarioId').notEmpty().withMessage('ID do usuário é obrigatório'),
  body('tipo').notEmpty().withMessage('Tipo é obrigatório'),
  body('titulo').trim().notEmpty().withMessage('Título é obrigatório'),
  body('mensagem').trim().notEmpty().withMessage('Mensagem é obrigatória')
], notificacaoController.create);

// Obter detalhes de uma notificação
router.get('/:id', notificacaoController.getById);

// Marcar notificação como lida
router.patch('/:id/read', notificacaoController.markAsRead);

// Marcar notificação como não lida
router.patch('/:id/unread', notificacaoController.markAsUnread);

// Deletar notificação
router.delete('/:id', notificacaoController.delete);

module.exports = router;
