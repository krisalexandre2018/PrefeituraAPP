#!/usr/bin/env node

const http = require('http');
const https = require('https');

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

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: JSON.parse(data)
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function checkHealth(baseUrl) {
  console.log('\n' + '='.repeat(60));
  log('HEALTH CHECK DO BACKEND', 'cyan');
  console.log('='.repeat(60) + '\n');

  log(`URL Base: ${baseUrl}`, 'cyan');
  console.log('');

  // Health check básico
  try {
    log('1. Verificando endpoint /health...', 'yellow');
    const basic = await httpGet(`${baseUrl}/health`);

    if (basic.statusCode === 200) {
      log('   ✓ Servidor está online', 'green');
      log(`   Status: ${basic.data.status}`, 'green');
      log(`   Uptime: ${Math.round(basic.data.uptime)}s`, 'green');
      log(`   Ambiente: ${basic.data.environment}`, 'green');
    } else {
      log(`   ✗ Status Code: ${basic.statusCode}`, 'red');
    }
  } catch (error) {
    log(`   ✗ Erro: ${error.message}`, 'red');
    log('\n   O servidor está offline ou inacessível.', 'red');
    process.exit(1);
  }

  console.log('');

  // Health check detalhado
  try {
    log('2. Verificando endpoint /health/detailed...', 'yellow');
    const detailed = await httpGet(`${baseUrl}/health/detailed`);

    if (detailed.statusCode === 200) {
      log('   ✓ Health check detalhado OK', 'green');
      console.log('');

      const data = detailed.data;

      // Database
      if (data.services.database === 'connected') {
        log('   ✓ Database: Conectado', 'green');
      } else {
        log(`   ✗ Database: ${data.services.database}`, 'red');
        if (data.services.databaseError) {
          log(`     Erro: ${data.services.databaseError}`, 'red');
        }
      }

      // Cloudinary
      if (data.services.cloudinary === 'ok') {
        log('   ✓ Cloudinary: OK', 'green');
      } else if (data.services.cloudinary === 'not_configured') {
        log('   ⚠ Cloudinary: Não configurado', 'yellow');
      } else {
        log(`   ✗ Cloudinary: ${data.services.cloudinary}`, 'red');
        if (data.services.cloudinaryError) {
          log(`     Erro: ${data.services.cloudinaryError}`, 'red');
        }
      }

      // System info
      if (data.system) {
        console.log('');
        log('   Sistema:', 'cyan');
        log(`   - Memória Total: ${data.system.memory.total}`, 'cyan');
        log(`   - Memória Livre: ${data.system.memory.free}`, 'cyan');
        log(`   - Memória Usada: ${data.system.memory.used}`, 'cyan');
        log(`   - Processo (Heap): ${data.system.process.memory}`, 'cyan');
        log(`   - Node.js Version: ${data.system.process.version}`, 'cyan');
      }
    } else {
      log(`   ✗ Status Code: ${detailed.statusCode}`, 'red');
    }
  } catch (error) {
    log(`   ⚠ Endpoint /health/detailed não disponível`, 'yellow');
  }

  console.log('');

  // Readiness check
  try {
    log('3. Verificando readiness probe...', 'yellow');
    const ready = await httpGet(`${baseUrl}/health/ready`);

    if (ready.statusCode === 200) {
      log('   ✓ Servidor pronto para receber tráfego', 'green');
    } else {
      log('   ✗ Servidor não está pronto', 'red');
    }
  } catch (error) {
    log(`   ⚠ Endpoint /health/ready não disponível`, 'yellow');
  }

  console.log('');

  // Liveness check
  try {
    log('4. Verificando liveness probe...', 'yellow');
    const live = await httpGet(`${baseUrl}/health/live`);

    if (live.statusCode === 200) {
      log('   ✓ Servidor está vivo', 'green');
    } else {
      log('   ✗ Servidor não está respondendo', 'red');
    }
  } catch (error) {
    log(`   ⚠ Endpoint /health/live não disponível`, 'yellow');
  }

  console.log('\n' + '='.repeat(60));
  log('HEALTH CHECK CONCLUÍDO', 'green');
  console.log('='.repeat(60) + '\n');
}

// Parse argumentos
const args = process.argv.slice(2);
const defaultUrl = 'http://localhost:3000';
const baseUrl = args[0] || process.env.BACKEND_URL || defaultUrl;

checkHealth(baseUrl).catch((error) => {
  log(`\nERRO FATAL: ${error.message}`, 'red');
  process.exit(1);
});
