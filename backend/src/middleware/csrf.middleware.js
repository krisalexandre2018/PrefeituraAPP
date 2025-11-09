const crypto = require('crypto');

// Armazenamento em memória de tokens (em produção usar Redis)
const tokenStore = new Map();

// Limpar tokens expirados a cada 1 hora
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
}, 60 * 60 * 1000);

/**
 * Gerar token CSRF
 */
function generateCsrfToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas

  tokenStore.set(token, {
    userId,
    expiresAt,
    createdAt: Date.now()
  });

  return token;
}

/**
 * Validar token CSRF
 */
function validateCsrfToken(token, userId) {
  const data = tokenStore.get(token);

  if (!data) {
    return false;
  }

  if (Date.now() > data.expiresAt) {
    tokenStore.delete(token);
    return false;
  }

  if (data.userId !== userId) {
    return false;
  }

  return true;
}

/**
 * Middleware para validar CSRF em requisições de modificação
 */
function csrfProtection(req, res, next) {
  // Apenas validar em métodos que modificam dados
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Pegar token do header
  const token = req.headers['x-csrf-token'];

  if (!token) {
    return res.status(403).json({ error: 'Token CSRF não fornecido' });
  }

  // Validar token
  if (!validateCsrfToken(token, req.userId)) {
    return res.status(403).json({ error: 'Token CSRF inválido ou expirado' });
  }

  next();
}

/**
 * Endpoint para obter token CSRF
 */
function getCsrfToken(req, res) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const token = generateCsrfToken(req.userId);
  res.json({ csrfToken: token });
}

module.exports = {
  csrfProtection,
  getCsrfToken,
  generateCsrfToken,
  validateCsrfToken
};
