import winston from 'winston';
import 'dotenv/config';
import DailyRotateFile from 'winston-daily-rotate-file';

const LEVEL = process.env.LOG_LEVEL || 'info';

// Налаштування форматів логування
const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [PID: ${process.pid}] [PM_ID: ${
    process.env.pm_id || 'N/A'
  }] ${level.toUpperCase()}: ${message}`;
});

const getTransports = (logType) => {
  const transports = [];

  // Додаємо вивід у файл
  transports.push(
    new DailyRotateFile({
      filename: `./logs/%DATE%-${logType}.log`,
      datePattern: 'YYYY-MM-DD',
      maxFiles: '5d',
      maxSize: '10m',
      zippedArchive: true,
    })
  );

  if (LEVEL === 'debug') {
    transports.push(new winston.transports.Console());
  }

  return transports;
};

// Логер для загальних повідомлень
const serviceLogger = winston.createLogger({
  level: LEVEL,
  format: combine(timestamp(), myFormat),
  transports: getTransports('service'),
});

// Логер для помилок
const errorLogger = winston.createLogger({
  level: 'error',
  format: combine(timestamp(), myFormat),
  transports: getTransports('error'),
});

export { serviceLogger, errorLogger };
