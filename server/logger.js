/**
 * Logger Module
 * Centralized logging system for detailed debugging and monitoring
 */

const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Configuration
let config = {
  level: LOG_LEVELS.DEBUG,
  console: true,
  file: false,
  filePath: path.join(__dirname, 'logs', 'app.log'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  broadcast: null, // WebSocket broadcast function
  colors: true
};

// ANSI colors for console output
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// In-memory log buffer for retrieval
let logBuffer = [];
const MAX_BUFFER_SIZE = 500;

/**
 * Configure the logger
 */
function configure(options) {
  config = { ...config, ...options };

  // Create log directory if file logging is enabled
  if (config.file) {
    const logDir = path.dirname(config.filePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }
}

/**
 * Set the broadcast function for WebSocket logging
 */
function setBroadcast(broadcastFn) {
  config.broadcast = broadcastFn;
}

/**
 * Format timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Get color for log level
 */
function getLevelColor(level) {
  switch (level) {
    case 'DEBUG': return COLORS.dim + COLORS.cyan;
    case 'INFO': return COLORS.green;
    case 'WARN': return COLORS.yellow;
    case 'ERROR': return COLORS.red;
    default: return COLORS.white;
  }
}

/**
 * Format log message for console
 */
function formatConsole(level, component, message, data) {
  const timestamp = getTimestamp();
  const levelColor = config.colors ? getLevelColor(level) : '';
  const reset = config.colors ? COLORS.reset : '';
  const dimColor = config.colors ? COLORS.dim : '';

  let formatted = `${dimColor}${timestamp}${reset} ${levelColor}[${level}]${reset}`;

  if (component) {
    formatted += ` ${config.colors ? COLORS.magenta : ''}[${component}]${reset}`;
  }

  formatted += ` ${message}`;

  if (data && Object.keys(data).length > 0) {
    formatted += ` ${dimColor}${JSON.stringify(data)}${reset}`;
  }

  return formatted;
}

/**
 * Format log message for file/storage
 */
function formatStructured(level, component, message, data) {
  return {
    timestamp: getTimestamp(),
    level,
    component: component || 'system',
    message,
    data: data || {}
  };
}

/**
 * Write to log file
 */
function writeToFile(logEntry) {
  if (!config.file) return;

  try {
    const line = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(config.filePath, line);

    // Check file size and rotate if needed
    const stats = fs.statSync(config.filePath);
    if (stats.size > config.maxFileSize) {
      rotateLogFile();
    }
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
}

/**
 * Rotate log file
 */
function rotateLogFile() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedPath = config.filePath.replace('.log', `-${timestamp}.log`);
    fs.renameSync(config.filePath, rotatedPath);
  } catch (err) {
    console.error('Failed to rotate log file:', err.message);
  }
}

/**
 * Core log function
 */
function log(level, levelNum, component, message, data) {
  if (levelNum < config.level) return;

  const structured = formatStructured(level, component, message, data);

  // Add to buffer
  logBuffer.push(structured);
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }

  // Console output
  if (config.console) {
    const formatted = formatConsole(level, component, message, data);
    console.log(formatted);
  }

  // File output
  writeToFile(structured);

  // WebSocket broadcast (for real-time monitoring)
  if (config.broadcast && levelNum >= LOG_LEVELS.INFO) {
    config.broadcast({
      type: 'log',
      data: {
        timestamp: structured.timestamp,
        type: level.toLowerCase(),
        message: component ? `[${component}] ${message}` : message,
        data
      }
    });
  }

  return structured;
}

/**
 * Create a logger instance with a specific component name
 */
function createLogger(component) {
  return {
    debug: (message, data) => log('DEBUG', LOG_LEVELS.DEBUG, component, message, data),
    info: (message, data) => log('INFO', LOG_LEVELS.INFO, component, message, data),
    warn: (message, data) => log('WARN', LOG_LEVELS.WARN, component, message, data),
    error: (message, data) => log('ERROR', LOG_LEVELS.ERROR, component, message, data),

    // Timing utility
    time: (label) => {
      const start = Date.now();
      return {
        end: (message) => {
          const duration = Date.now() - start;
          log('DEBUG', LOG_LEVELS.DEBUG, component, message || `${label} completed`, { duration: `${duration}ms` });
          return duration;
        }
      };
    },

    // Group related logs
    group: (groupName) => {
      const groupLogs = [];
      return {
        add: (level, message, data) => {
          groupLogs.push({ level, message, data });
        },
        end: () => {
          log('INFO', LOG_LEVELS.INFO, component, `[${groupName}] Group completed`, {
            logCount: groupLogs.length,
            logs: groupLogs
          });
        }
      };
    }
  };
}

/**
 * Get recent logs from buffer
 */
function getRecentLogs(count = 100, filter = {}) {
  let logs = logBuffer.slice(-count);

  if (filter.level) {
    logs = logs.filter(l => l.level === filter.level.toUpperCase());
  }

  if (filter.component) {
    logs = logs.filter(l => l.component === filter.component);
  }

  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    logs = logs.filter(l =>
      l.message.toLowerCase().includes(searchLower) ||
      JSON.stringify(l.data).toLowerCase().includes(searchLower)
    );
  }

  return logs;
}

/**
 * Clear log buffer
 */
function clearBuffer() {
  logBuffer = [];
}

// Default logger (no component)
const defaultLogger = {
  debug: (message, data) => log('DEBUG', LOG_LEVELS.DEBUG, null, message, data),
  info: (message, data) => log('INFO', LOG_LEVELS.INFO, null, message, data),
  warn: (message, data) => log('WARN', LOG_LEVELS.WARN, null, message, data),
  error: (message, data) => log('ERROR', LOG_LEVELS.ERROR, null, message, data)
};

module.exports = {
  // Configuration
  configure,
  setBroadcast,
  LOG_LEVELS,

  // Logger creation
  createLogger,

  // Default logging functions
  ...defaultLogger,

  // Log retrieval
  getRecentLogs,
  clearBuffer
};
