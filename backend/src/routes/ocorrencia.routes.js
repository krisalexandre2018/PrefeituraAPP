const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const ocorrenciaController = require('../controllers/ocorrencia.controller');
const { authMiddleware, isJuridicoOrAdmin } = require('../middleware/auth.middleware');
const { csrfProtection } = require('../middleware/csrf.middleware');

const router = express.Router();

// Configurar Multer para upload de imagens (memória)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
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

// CSRF protection em rotas de modificação (POST, PATCH, DELETE)
router.use(csrfProtection);

// Criar nova ocorrência (apenas vereadores)
router.post('/', upload.array('fotos', 5), [
  body('titulo').trim().notEmpty().withMessage('Título é obrigatório').isLength({ max: 200 }).withMessage('Título muito longo'),
  body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('categoria').optional().isIn(['INFRAESTRUTURA', 'ILUMINACAO', 'LIMPEZA', 'SAUDE', 'EDUCACAO', 'SEGURANCA', 'TRANSPORTE', 'MEIO_AMBIENTE', 'OUTROS']).withMessage('Categoria inválida'),
  body('endereco').trim().notEmpty().withMessage('Endereço é obrigatório'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida'),
  body('prioridade').optional().isIn(['BAIXA', 'MEDIA', 'ALTA']).withMessage('Prioridade inválida')
], ocorrenciaController.create);

// Listar ocorrências
router.get('/', ocorrenciaController.list);

// Estatísticas (admin e jurídico)
router.get('/stats', isJuridicoOrAdmin, ocorrenciaController.getStats);

// Obter detalhes de uma ocorrência
router.get('/:id', ocorrenciaController.getById);

// Atualizar status (apenas jurídico e admin)
router.patch('/:id/status', isJuridicoOrAdmin, [
  body('status').isIn(['EM_ANALISE', 'RESOLVIDO', 'REJEITADO']).withMessage('Status inválido'),
  body('comentario').optional().trim()
], ocorrenciaController.updateStatus);

// Deletar ocorrência
router.delete('/:id', ocorrenciaController.delete);

module.exports = router;
