#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        value = value.replace(/^["']|["']$/g, '');
        env[key.trim()] = value;
      }
    }
  });

  return env;
}

function parseDatabaseUrl(url) {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('URL do banco de dados inválida');
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5]
  };
}

function createBackupDir() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-');
}

function backupDatabase(dbConfig, backupDir) {
  const timestamp = getTimestamp();
  const filename = `backup_${dbConfig.database}_${timestamp}.sql`;
  const filepath = path.join(backupDir, filename);

  log(`Criando backup do banco de dados: ${dbConfig.database}`, 'cyan');
  log(`Arquivo: ${filename}`, 'cyan');

  const pgPassword = `PGPASSWORD=${dbConfig.password}`;
  const pgDumpCmd = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database}`;

  try {
    const command = process.platform === 'win32'
      ? `set ${pgPassword} && ${pgDumpCmd} > "${filepath}"`
      : `${pgPassword} ${pgDumpCmd} > "${filepath}"`;

    execSync(command, { shell: true, stdio: 'inherit' });

    const stats = fs.statSync(filepath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    log(`✓ Backup criado com sucesso!`, 'green');
    log(`  Arquivo: ${filepath}`, 'green');
    log(`  Tamanho: ${fileSizeMB} MB`, 'green');

    return filepath;
  } catch (error) {
    log(`✗ Erro ao criar backup: ${error.message}`, 'red');
    throw error;
  }
}

function backupWithDocker(dbConfig, backupDir) {
  const timestamp = getTimestamp();
  const filename = `backup_${dbConfig.database}_${timestamp}.sql`;
  const filepath = path.join(backupDir, filename);

  log(`Criando backup via Docker...`, 'cyan');

  try {
    const command = `docker-compose exec -T postgres pg_dump -U ${dbConfig.user} ${dbConfig.database}`;
    const output = execSync(command, { encoding: 'utf-8' });

    fs.writeFileSync(filepath, output);

    const stats = fs.statSync(filepath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    log(`✓ Backup criado com sucesso!`, 'green');
    log(`  Arquivo: ${filepath}`, 'green');
    log(`  Tamanho: ${fileSizeMB} MB`, 'green');

    return filepath;
  } catch (error) {
    log(`✗ Erro ao criar backup via Docker: ${error.message}`, 'red');
    throw error;
  }
}

function cleanOldBackups(backupDir, keepLast = 10) {
  log(`\nLimpando backups antigos (mantendo últimos ${keepLast})...`, 'cyan');

  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: path.join(backupDir, f),
      time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length <= keepLast) {
    log(`✓ ${files.length} backup(s) encontrado(s). Nenhum removido.`, 'green');
    return;
  }

  const toDelete = files.slice(keepLast);
  let deletedCount = 0;

  toDelete.forEach(file => {
    try {
      fs.unlinkSync(file.path);
      deletedCount++;
    } catch (error) {
      log(`⚠ Erro ao remover ${file.name}: ${error.message}`, 'yellow');
    }
  });

  log(`✓ ${deletedCount} backup(s) antigo(s) removido(s)`, 'green');
  log(`✓ ${files.length - deletedCount} backup(s) mantido(s)`, 'green');
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('BACKUP DO BANCO DE DADOS', 'cyan');
  console.log('='.repeat(60) + '\n');

  // Carregar configuração
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  const env = loadEnvFile(envPath);

  if (!env.DATABASE_URL) {
    log('✗ DATABASE_URL não encontrada em backend/.env', 'red');
    process.exit(1);
  }

  // Parse database URL
  let dbConfig;
  try {
    dbConfig = parseDatabaseUrl(env.DATABASE_URL);
  } catch (error) {
    log(`✗ ${error.message}`, 'red');
    process.exit(1);
  }

  // Criar diretório de backup
  const backupDir = createBackupDir();
  log(`Diretório de backup: ${backupDir}\n`, 'cyan');

  // Verificar método de backup
  let backupPath;
  const useDocker = process.argv.includes('--docker');

  try {
    if (useDocker) {
      // Verificar se Docker está disponível
      execSync('docker-compose ps', { stdio: 'ignore' });
      backupPath = backupWithDocker(dbConfig, backupDir);
    } else {
      // Verificar se pg_dump está disponível
      execSync('pg_dump --version', { stdio: 'ignore' });
      backupPath = backupDatabase(dbConfig, backupDir);
    }
  } catch (error) {
    if (!useDocker) {
      log('\n⚠ pg_dump não encontrado. Tentando via Docker...', 'yellow');
      try {
        backupPath = backupWithDocker(dbConfig, backupDir);
      } catch (dockerError) {
        log('\n✗ Falha ao criar backup. Instale PostgreSQL ou Docker.', 'red');
        log('  PostgreSQL: https://www.postgresql.org/download/', 'cyan');
        log('  Docker: https://www.docker.com/get-started', 'cyan');
        process.exit(1);
      }
    } else {
      throw error;
    }
  }

  // Limpar backups antigos
  const keepLast = parseInt(process.env.BACKUP_KEEP_LAST || '10', 10);
  cleanOldBackups(backupDir, keepLast);

  // Instruções de restauração
  console.log('\n' + '='.repeat(60));
  log('BACKUP CONCLUÍDO', 'green');
  console.log('='.repeat(60) + '\n');

  log('Para restaurar este backup:', 'cyan');
  console.log('');
  log('Método 1 - PostgreSQL:', 'yellow');
  log(`  psql -h ${dbConfig.host} -U ${dbConfig.user} -d ${dbConfig.database} < ${backupPath}`, 'cyan');
  console.log('');
  log('Método 2 - Docker:', 'yellow');
  log(`  cat ${backupPath} | docker-compose exec -T postgres psql -U ${dbConfig.user} -d ${dbConfig.database}`, 'cyan');
  console.log('');

  log('Agendamento automático:', 'yellow');
  log('  Linux/Mac: Adicione ao crontab:', 'cyan');
  log(`  0 2 * * * cd ${path.join(__dirname, '..')} && npm run backup:db`, 'cyan');
  console.log('');
  log('  Windows: Use Agendador de Tarefas', 'cyan');
  console.log('');
}

main().catch(error => {
  log(`\nERRO FATAL: ${error.message}`, 'red');
  process.exit(1);
});
