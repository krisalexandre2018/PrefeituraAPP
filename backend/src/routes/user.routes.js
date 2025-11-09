const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authMiddleware, isAdmin, isSuperAdmin } = require('../middleware/auth.middleware');
const { csrfProtection } = require('../middleware/csrf.middleware');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CSRF protection em rotas de modificação
router.use(csrfProtection);

// Configurar Multer para upload de foto de perfil
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Upload de foto de perfil (qualquer usuário autenticado)
router.post('/profile-picture', upload.single('foto'), userController.uploadProfilePicture);

// Rotas super admin (apenas o dono do sistema)
router.get('/stats', isSuperAdmin, userController.getStats);
router.get('/pending', isSuperAdmin, userController.listPending);
router.get('/', isSuperAdmin, userController.list);
router.get('/:id', isSuperAdmin, userController.getById);

router.patch('/:id/approve', isSuperAdmin, [
  body('tipo').optional().isIn(['ADMIN', 'VEREADOR', 'JURIDICO']).withMessage('Tipo inválido')
], userController.approve);
router.patch('/:id/deactivate', isSuperAdmin, [
  body('motivo').optional().trim()
], userController.deactivate);
router.patch('/:id/reactivate', isSuperAdmin, userController.reactivate);
router.patch('/:id/type', isSuperAdmin, [
  body('tipo').isIn(['ADMIN', 'VEREADOR', 'JURIDICO']).withMessage('Tipo inválido')
], userController.updateType);

router.delete('/:id', isSuperAdmin, userController.delete);

module.exports = router;
