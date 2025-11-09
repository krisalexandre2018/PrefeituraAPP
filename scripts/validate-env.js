#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateUrl(urlString, name) {
  try {
    new URL(urlString);
    log(`✓ ${name} é uma URL válida`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${name} não é uma URL válida: ${urlString}`, 'red');
    return false;
  }
}

function validatePort(port, name) {
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    log(`✗ ${name} não é uma porta válida: ${port}`, 'red');
    return false;
  }
  log(`✓ ${name} é válida: ${port}`, 'green');
  return true;
}

function validateEmail(email, name) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    log(`✗ ${name} não é um email válido: ${email}`, 'red');
    return false;
  }
  log(`✓ ${name} é válido`, 'green');
  return true;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        // Remove aspas
        value = value.replace(/^["']|["']$/g, '');
        env[key.trim()] = value;
      }
    }
  });

  return env;
}

async function testDatabaseConnection(databaseUrl) {
  try {
    // Tentar conectar com PostgreSQL usando pg
    const { Client } = require('pg');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query('SELECT NOW()');
    await client.end();
    log('✓ Conexão com banco de dados bem-sucedida', 'green');
    return true;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      log('⚠ Módulo pg não instalado, pulando teste de conexão', 'yellow');
      return null;
    }
    log(`✗ Falha ao conectar com banco de dados: ${error.message}`, 'red');
    return false;
  }
}

async function testCloudinary(cloudName, apiKey, apiSecret) {
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    await cloudinary.api.ping();
    log('✓ Credenciais Cloudinary válidas', 'green');
    return true;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      log('⚠ Módulo cloudinary não instalado, pulando teste', 'yellow');
      return null;
    }
    log(`✗ Falha ao validar Cloudinary: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE', 'cyan');
  console.log('='.repeat(60) + '\n');

  const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');

  if (!fs.existsSync(backendEnvPath)) {
    log('✗ Arquivo backend/.env não encontrado!', 'red');
    log('Execute: npm run setup', 'yellow');
    process.exit(1);
  }

  log('Carregando backend/.env...', 'cyan');
  const env = loadEnvFile(backendEnvPath);

  if (!env) {
    log('✗ Falha ao carregar .env', 'red');
    process.exit(1);
  }

  let errors = 0;
  let warnings = 0;

  // Validações obrigatórias
  console.log('\n--- Configurações Obrigatórias ---\n');

  // DATABASE_URL
  if (!env.DATABASE_URL) {
    log('✗ DATABASE_URL não definida', 'red');
    errors++;
  } else if (env.DATABASE_URL.includes('senha123') || env.DATABASE_URL.includes('localhost')) {
    log('⚠ DATABASE_URL usando valores padrão - altere para produção', 'yellow');
    warnings++;
    validateUrl(env.DATABASE_URL, 'DATABASE_URL');
  } else {
    validateUrl(env.DATABASE_URL, 'DATABASE_URL');
  }

  // JWT_SECRET
  if (!env.JWT_SECRET) {
    log('✗ JWT_SECRET não definida', 'red');
    errors++;
  } else if (env.JWT_SECRET.includes('sua_chave') || env.JWT_SECRET.length < 32) {
    log('✗ JWT_SECRET muito fraca ou usando valor de exemplo', 'red');
    log('  Use: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"', 'cyan');
    errors++;
  } else {
    log('✓ JWT_SECRET definida', 'green');
  }

  // PORT
  if (!env.PORT) {
    log('⚠ PORT não definida, usando padrão 3000', 'yellow');
    warnings++;
  } else {
    validatePort(env.PORT, 'PORT');
  }

  // NODE_ENV
  if (!env.NODE_ENV) {
    log('⚠ NODE_ENV não definida', 'yellow');
    warnings++;
  } else {
    log(`✓ NODE_ENV: ${env.NODE_ENV}`, 'green');
  }

  // Cloudinary
  console.log('\n--- Cloudinary ---\n');

  if (!env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME.includes('seu_')) {
    log('✗ CLOUDINARY_CLOUD_NAME não configurada', 'red');
    errors++;
  } else {
    log('✓ CLOUDINARY_CLOUD_NAME definida', 'green');
  }

  if (!env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY.includes('sua_')) {
    log('✗ CLOUDINARY_API_KEY não configurada', 'red');
    errors++;
  } else {
    log('✓ CLOUDINARY_API_KEY definida', 'green');
  }

  if (!env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET.includes('sua_')) {
    log('✗ CLOUDINARY_API_SECRET não configurada', 'red');
    errors++;
  } else {
    log('✓ CLOUDINARY_API_SECRET definida', 'green');
  }

  // Email
  console.log('\n--- Configurações de Email ---\n');

  if (!env.EMAIL_HOST) {
    log('⚠ EMAIL_HOST não definida', 'yellow');
    warnings++;
  } else {
    log(`✓ EMAIL_HOST: ${env.EMAIL_HOST}`, 'green');
  }

  if (!env.EMAIL_PORT) {
    log('⚠ EMAIL_PORT não definida', 'yellow');
    warnings++;
  } else {
    validatePort(env.EMAIL_PORT, 'EMAIL_PORT');
  }

  if (!env.EMAIL_USER || env.EMAIL_USER.includes('seuemail')) {
    log('⚠ EMAIL_USER não configurado', 'yellow');
    warnings++;
  } else {
    validateEmail(env.EMAIL_USER, 'EMAIL_USER');
  }

  if (!env.EMAIL_PASS || env.EMAIL_PASS.includes('sua_senha')) {
    log('⚠ EMAIL_PASS não configurada', 'yellow');
    warnings++;
  } else {
    log('✓ EMAIL_PASS definida', 'green');
  }

  // CORS
  console.log('\n--- CORS ---\n');

  if (!env.FRONTEND_URL) {
    log('⚠ FRONTEND_URL não definida', 'yellow');
    warnings++;
  } else {
    validateUrl(env.FRONTEND_URL, 'FRONTEND_URL');
  }

  // Testes de conexão
  console.log('\n--- Testes de Conexão ---\n');

  if (env.DATABASE_URL) {
    await testDatabaseConnection(env.DATABASE_URL);
  }

  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    if (!env.CLOUDINARY_CLOUD_NAME.includes('seu_')) {
      await testCloudinary(
        env.CLOUDINARY_CLOUD_NAME,
        env.CLOUDINARY_API_KEY,
        env.CLOUDINARY_API_SECRET
      );
    }
  }

  // Resumo
  console.log('\n' + '='.repeat(60));
  log('RESUMO DA VALIDAÇÃO', 'cyan');
  console.log('='.repeat(60) + '\n');

  if (errors === 0 && warnings === 0) {
    log('✓ Todas as validações passaram!', 'green');
    console.log('');
    log('Seu ambiente está configurado corretamente.', 'green');
  } else {
    if (errors > 0) {
      log(`✗ ${errors} erro(s) encontrado(s)`, 'red');
    }
    if (warnings > 0) {
      log(`⚠ ${warnings} aviso(s) encontrado(s)`, 'yellow');
    }
    console.log('');

    if (errors > 0) {
      log('Corrija os erros antes de continuar.', 'red');
      log('Edite: backend/.env', 'cyan');
      process.exit(1);
    } else {
      log('Seu ambiente tem alguns avisos, mas está funcional.', 'yellow');
    }
  }

  console.log('');
}

main().catch(error => {
  log(`\nERRO FATAL: ${error.message}`, 'red');
  process.exit(1);
});
