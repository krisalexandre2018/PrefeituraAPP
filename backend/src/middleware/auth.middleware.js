const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar se o usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        tipo: true,
        status: true,
        isSuperAdmin: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (user.status !== 'ATIVO') {
      return res.status(403).json({ error: 'Conta inativa ou pendente de aprovação' });
    }

    req.userId = user.id;
    req.userType = user.tipo;
    req.isSuperAdmin = user.isSuperAdmin || false;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Erro na autenticação' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.userType) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (roles.length && !roles.includes(req.userType)) {
      return res.status(403).json({
        error: `Acesso negado. Requer: ${roles.join(' ou ')}`
      });
    }

    next();
  };
};

const isAdmin = (req, res, next) => {
  if (req.userType !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

const isJuridicoOrAdmin = (req, res, next) => {
  if (req.userType !== 'ADMIN' && req.userType !== 'JURIDICO') {
    return res.status(403).json({ error: 'Acesso negado. Apenas jurídico ou admin.' });
  }
  next();
};

const isVereador = (req, res, next) => {
  if (req.userType !== 'VEREADOR') {
    return res.status(403).json({ error: 'Acesso negado. Apenas vereadores.' });
  }
  next();
};

const isSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas super administrador.' });
  }
  next();
};

module.exports = {
  authMiddleware,
  authorize,
  isAdmin,
  isJuridicoOrAdmin,
  isVereador,
  isSuperAdmin
};
