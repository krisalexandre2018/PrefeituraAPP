const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * GET /health
 * Health check básico
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /health/detailed
 * Health check detalhado com verificação de serviços
 */
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'checking',
      cloudinary: 'checking'
    },
    system: {
      memory: {
        total: Math.round(require('os').totalmem() / 1024 / 1024) + 'MB',
        free: Math.round(require('os').freemem() / 1024 / 1024) + 'MB',
        used: Math.round((require('os').totalmem() - require('os').freemem()) / 1024 / 1024) + 'MB'
      },
      process: {
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        pid: process.pid,
        version: process.version
      }
    }
  };

  let overallStatus = 'ok';

  // Verificar conexão com banco de dados
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'connected';
    logger.debug('Health check: Database OK');
  } catch (error) {
    health.services.database = 'disconnected';
    health.services.databaseError = error.message;
    overallStatus = 'degraded';
    logger.error('Health check: Database failed', { error: error.message });
  }

  // Verificar Cloudinary
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET) {
      await cloudinary.api.ping();
      health.services.cloudinary = 'ok';
      logger.debug('Health check: Cloudinary OK');
    } else {
      health.services.cloudinary = 'not_configured';
      logger.warn('Health check: Cloudinary not configured');
    }
  } catch (error) {
    health.services.cloudinary = 'error';
    health.services.cloudinaryError = error.message;
    overallStatus = 'degraded';
    logger.error('Health check: Cloudinary failed', { error: error.message });
  }

  // Definir status geral
  health.status = overallStatus;

  const statusCode = overallStatus === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /health/ready
 * Kubernetes readiness probe
 */
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({
      status: 'not_ready',
      error: error.message
    });
  }
});

/**
 * GET /health/live
 * Kubernetes liveness probe
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
