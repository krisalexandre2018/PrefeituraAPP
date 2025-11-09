const { validationResult } = require('express-validator');

/**
 * Middleware para processar resultados da validação do express-validator
 * Deve ser usado após os validadores em cada rota
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

module.exports = { handleValidationErrors };
