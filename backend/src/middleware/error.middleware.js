/**
 * Middleware global de tratamento de erros
 * Deve ser o último middleware registrado no app
 */

const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro do Multer (upload de arquivos)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande',
        details: 'O tamanho máximo permitido é 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Muitos arquivos',
        details: 'Máximo de 5 fotos por ocorrência'
      });
    }
    return res.status(400).json({
      error: 'Erro no upload',
      details: err.message
    });
  }

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    return res.status(400).json({
      error: 'Valor duplicado',
      details: `Já existe um registro com este ${field}`
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro não encontrado',
      details: 'O registro solicitado não existe'
    });
  }

  if (err.code?.startsWith('P')) {
    return res.status(400).json({
      error: 'Erro no banco de dados',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Erro ao processar operação'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado'
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      details: 'Verifique a formatação do corpo da requisição'
    });
  }

  // Erro padrão
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handler para rotas não encontradas (404)
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
};

/**
 * Wrapper assíncrono para evitar try-catch em todos os controllers
 * Uso: asyncHandler(async (req, res) => { ... })
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
