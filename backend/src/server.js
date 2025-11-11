require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ip = require('ip');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 8080;

// Security headers com Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Logging middleware (deve vir antes de outras rotas)
app.use(logger.middleware());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requisições por IP
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  }
});

// Aplicar rate limiting em todas as rotas da API
app.use('/api/', limiter);

// Health check routes (sem rate limit)
app.use('/health', require('./routes/health.routes'));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/csrf', require('./routes/csrf.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/ocorrencias', require('./routes/ocorrencia.routes'));
app.use('/api/notificacoes', require('./routes/notificacao.routes'));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API do Sistema de Ocorrências Urbanas',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      csrf: '/api/csrf',
      users: '/api/users',
      ocorrencias: '/api/ocorrencias',
      notificacoes: '/api/notificacoes',
      health: '/health'
    }
  });
});

// 404 Handler (deve vir antes do error handler)
app.use(notFoundHandler);

// Error Handler Global (deve ser o último middleware)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  logger.info('╔════════════════════════════════════════════╗');
  logger.info(`║  Servidor rodando na porta ${PORT}           ║`);
  const networkAddress = ip.address();
  logger.info(`║  Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(27)} ║`);
  logger.info(`║  Local: http://localhost:${PORT}                ║`);
  logger.info(`║  Network: http://${networkAddress}:${PORT}${' '.repeat(Math.max(0, 15 - networkAddress.length))}║`);
  logger.info(`║  Health: http://localhost:${PORT}/health     ║`);
  logger.info('╚════════════════════════════════════════════╝');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
