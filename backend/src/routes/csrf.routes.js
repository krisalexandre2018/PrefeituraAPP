const express = require('express');
const { getCsrfToken } = require('../middleware/csrf.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Obter token CSRF (requer autenticação)
router.get('/token', authMiddleware, getCsrfToken);

module.exports = router;
