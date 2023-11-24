const fs = require('node:fs');
const winston = require('winston');
require('winston-daily-rotate-file');

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'verbose',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.metadata(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.label({
          label: process.env.LOG_LABEL || 'REDIRECTOR',
          message: false,
        }),
        winston.format.colorize(),
        winston.format.printf(
          (info) => [
            // process.stdout.isTTY ? info.timestamp : '',
            info.timestamp,
            info.label ? `${info.label}:` : '',
            `${info.level}:`,
            info.message || '',
            info.metadata && Object.keys(info.metadata).length ? JSON.stringify(info.metadata) : '',
          ].filter((item) => item).join(' ').trim(),
        ),
      ),
    }),

    new winston.transports.DailyRotateFile({
      level: process.env.LOG_LEVEL || 'verbose',
      dirname: 'logs',
      datePattern: 'YYYY-MM-DD',
      filename: 'app.%DATE%.log',
      symlinkName: 'app.log',
      maxFiles: Number(process.env.LOG_KEEP_FILES) || 31,
    }),
  ],
});

module.exports = logger;
