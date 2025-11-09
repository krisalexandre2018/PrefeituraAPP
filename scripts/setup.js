#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function execCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`ERROR: ${errorMessage}`, 'red');
    return false;
  }
}

function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    log(`✓ ${name} está instalado`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${name} não encontrado`, 'red');
    return false;
  }
}

function checkPort(port) {
  try {
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function copyEnvFile(source, destination) {
  if (fs.existsSync(destination)) {
    log(`⚠ ${destination} já existe. Pulando...`, 'yellow');
    return false;
  }

  if (!fs.existsSync(source)) {
    log(`⚠ ${source} não encontrado`, 'yellow');
    return false;
  }

  fs.copyFileSync(source, destination);
  log(`✓ Criado ${destination}`, 'green');
  return true;
}

async function main() {
  header('SETUP DO SISTEMA DE OCORRÊNCIAS URBANAS');

  // 1. Verificar pré-requisitos
  header('1. Verificando Pré-requisitos');

  const hasNode = checkCommand('node', 'Node.js');
  const hasNpm = checkCommand('npm', 'NPM');
  const hasDocker = checkCommand('docker', 'Docker');

  if (!hasNode || !hasNpm) {
    log('\nERRO: Node.js e NPM são obrigatórios!', 'red');
    log('Baixe em: https://nodejs.org/', 'yellow');
    process.exit(1);
  }

  if (!hasDocker) {
    log('\n⚠ Docker não encontrado. Você precisará de PostgreSQL instalado localmente.', 'yellow');
    log('Opção 1: Instalar Docker - https://www.docker.com/get-started', 'cyan');
    log('Opção 2: Instalar PostgreSQL - https://www.postgresql.org/download/', 'cyan');
  }

  // 2. Criar arquivos .env
  header('2. Configurando Arquivos de Ambiente');

  const rootDir = path.join(__dirname, '..');
  const backendDir = path.join(rootDir, 'backend');

  copyEnvFile(
    path.join(backendDir, '.env.example'),
    path.join(backendDir, '.env')
  );

  copyEnvFile(
    path.join(rootDir, '.env.docker'),
    path.join(rootDir, '.env')
  );

  // 3. Instalar dependências
  header('3. Instalando Dependências');

  log('Instalando dependências do monorepo...', 'blue');
  if (!execCommand('npm install', 'Falha ao instalar dependências do monorepo')) {
    process.exit(1);
  }

  log('\nInstalando dependências do backend...', 'blue');
  if (!execCommand('cd backend && npm install', 'Falha ao instalar dependências do backend')) {
    process.exit(1);
  }

  log('\nInstalando dependências do mobile...', 'blue');
  if (!execCommand('cd mobile && npm install', 'Falha ao instalar dependências do mobile')) {
    process.exit(1);
  }

  // 4. Verificar PostgreSQL
  header('4. Verificando PostgreSQL');

  let postgresReady = false;

  if (hasDocker) {
    log('Iniciando PostgreSQL com Docker...', 'blue');
    if (execCommand('docker-compose up -d postgres', 'Falha ao iniciar PostgreSQL')) {
      log('Aguardando PostgreSQL inicializar...', 'yellow');
      execSync('timeout /t 5 > nul 2>&1 || sleep 5', { stdio: 'ignore' });
      postgresReady = true;
    }
  } else {
    const portInUse = checkPort(5432);
    if (portInUse) {
      log('✓ PostgreSQL detectado na porta 5432', 'green');
      postgresReady = true;
    } else {
      log('⚠ PostgreSQL não detectado. Inicie manualmente antes de continuar.', 'yellow');
    }
  }

  // 5. Executar migrations
  if (postgresReady) {
    header('5. Configurando Banco de Dados');

    log('Gerando Prisma Client...', 'blue');
    execCommand('cd backend && npx prisma generate', 'Falha ao gerar Prisma Client');

    log('\nExecutando migrations...', 'blue');
    execCommand('cd backend && npx prisma migrate dev', 'Falha ao executar migrations');
  } else {
    header('5. Banco de Dados (Pular)');
    log('PostgreSQL não está pronto. Execute manualmente:', 'yellow');
    log('  npm run prisma:generate', 'cyan');
    log('  npm run prisma:migrate', 'cyan');
  }

  // 6. Sucesso!
  header('SETUP CONCLUÍDO COM SUCESSO!');

  log('\nPróximos Passos:', 'green');
  console.log('');
  log('1. Configure as variáveis de ambiente:', 'bright');
  log('   - Edite backend/.env com suas credenciais', 'cyan');
  log('   - Configure Cloudinary, JWT_SECRET, Email, etc.', 'cyan');
  console.log('');
  log('2. Inicie o ambiente de desenvolvimento:', 'bright');
  log('   npm run dev', 'cyan');
  console.log('');
  log('3. Ou inicie separadamente:', 'bright');
  log('   npm run dev:backend  # Backend na porta 3000', 'cyan');
  log('   npm run dev:mobile   # Mobile com Expo', 'cyan');
  console.log('');
  log('4. Acesse o Prisma Studio (opcional):', 'bright');
  log('   npm run prisma:studio', 'cyan');
  console.log('');
  log('5. Validar configuração:', 'bright');
  log('   npm run validate:env', 'cyan');
  console.log('');

  if (hasDocker) {
    log('Docker:', 'bright');
    log('   docker-compose logs -f postgres  # Ver logs', 'cyan');
    log('   docker-compose --profile admin up -d  # Iniciar PgAdmin', 'cyan');
    log('   PgAdmin: http://localhost:5050', 'cyan');
    console.log('');
  }

  log('Documentação adicional:', 'bright');
  log('   README.md - Guia geral do projeto', 'cyan');
  log('   DEPLOY.md - Instruções de deploy', 'cyan');
  console.log('');
}

main().catch(error => {
  log(`\nERRO FATAL: ${error.message}`, 'red');
  process.exit(1);
});
