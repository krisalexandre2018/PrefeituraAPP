const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Níveis de log
const levels = {
  ERROR: { value: 0, color: 'red', label: 'ERROR' },
  WARN: { value: 1, color: 'yellow', label: 'WARN ' },
  INFO: { value: 2, color: 'cyan', label: 'INFO ' },
  HTTP: { value: 3, color: 'green', label: 'HTTP ' },
  DEBUG: { value: 4, color: 'blue', label: 'DEBUG' }
};

class Logger {
  constructor(options = {}) {
    const levelKey = (options.level || 'INFO').toUpperCase();
    this.minLevel = levels[levelKey] || levels.INFO;
    this.enableFile = options.enableFile !== false;
    this.enableConsole = options.enableConsole !== false;
    this.logDir = options.logDir || path.join(__dirname, '../../logs');
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;

    // Criar diretório de logs se não existir
    if (this.enableFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  _formatTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  _formatMessage(level, message, meta) {
    const timestamp = this._formatTimestamp();
    const logEntry = {
      timestamp,
      level: level.label.trim(),
      message
    };

    if (meta && Object.keys(meta).length > 0) {
      logEntry.meta = meta;
    }

    return logEntry;
  }

  _writeToFile(level, logEntry) {
    if (!this.enableFile) return;

    try {
      const filename = level.value === 0 ? 'error.log' : 'combined.log';
      const filepath = path.join(this.logDir, filename);

      // Verificar tamanho do arquivo e rotacionar se necessário
      this._rotateLogIfNeeded(filepath);

      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(filepath, logLine, 'utf8');
    } catch (error) {
      console.error('Erro ao escrever log em arquivo:', error);
    }
  }

  _rotateLogIfNeeded(filepath) {
    try {
      if (!fs.existsSync(filepath)) return;

      const stats = fs.statSync(filepath);
      if (stats.size < this.maxFileSize) return;

      // Rotacionar logs
      const ext = path.extname(filepath);
      const base = path.basename(filepath, ext);
      const dir = path.dirname(filepath);

      // Remover o arquivo mais antigo se existir
      const oldestFile = path.join(dir, `${base}.${this.maxFiles - 1}${ext}`);
      if (fs.existsSync(oldestFile)) {
        fs.unlinkSync(oldestFile);
      }

      // Renomear arquivos existentes
      for (let i = this.maxFiles - 2; i >= 0; i--) {
        const oldFile = i === 0
          ? filepath
          : path.join(dir, `${base}.${i}${ext}`);

        if (fs.existsSync(oldFile)) {
          const newFile = path.join(dir, `${base}.${i + 1}${ext}`);
          fs.renameSync(oldFile, newFile);
        }
      }
    } catch (error) {
      console.error('Erro ao rotacionar log:', error);
    }
  }

  _writeToConsole(level, message, meta) {
    if (!this.enableConsole) return;

    const timestamp = this._formatTimestamp();
    const color = colors[level.color];
    const reset = colors.reset;
    const gray = colors.gray;

    let output = `${gray}${timestamp}${reset} ${color}[${level.label}]${reset} ${message}`;

    if (meta && Object.keys(meta).length > 0) {
      output += `\n${gray}${JSON.stringify(meta, null, 2)}${reset}`;
    }

    console.log(output);
  }

  _log(level, message, meta = {}) {
    // Verificar se deve logar este nível
    if (level.value > this.minLevel.value) return;

    const logEntry = this._formatMessage(level, message, meta);

    this._writeToConsole(level, message, meta);
    this._writeToFile(level, logEntry);
  }

  error(message, meta) {
    this._log(levels.ERROR, message, meta);
  }

  warn(message, meta) {
    this._log(levels.WARN, message, meta);
  }

  info(message, meta) {
    this._log(levels.INFO, message, meta);
  }

  http(message, meta) {
    this._log(levels.HTTP, message, meta);
  }

  debug(message, meta) {
    this._log(levels.DEBUG, message, meta);
  }

  // Middleware para Express
  middleware() {
    return (req, res, next) => {
      const start = Date.now();

      // Log da requisição
      res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl}`;

        const meta = {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent')
        };

        // Adicionar userId se autenticado
        if (req.user && req.user.id) {
          meta.userId = req.user.id;
        }

        // Escolher nível baseado no status
        if (res.statusCode >= 500) {
          this.error(message, meta);
        } else if (res.statusCode >= 400) {
          this.warn(message, meta);
        } else {
          this.http(message, meta);
        }
      });

      next();
    };
  }
}

// Instância singleton
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG');

const logger = new Logger({
  level: logLevel,
  enableFile: process.env.NODE_ENV !== 'test',
  enableConsole: true
});

module.exports = logger;
