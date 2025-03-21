import winston, { Logger } from 'winston';
import 'dotenv/config';
import DailyRotateFile from 'winston-daily-rotate-file';

const LEVEL: string = process.env.LOG_LEVEL || 'info';

// Налаштування форматів логування
const { combine, timestamp, printf } = winston.format;

// Використовуйте TransformableInfo для сумісності з Winston
const myFormat = printf((info: winston.Logform.TransformableInfo) => {
  const { level, message, timestamp } = info;
  return `${timestamp} ${level}: ${message}`;
});

// Логер для загальних повідомлень
const serviceLogger: Logger = winston.createLogger({
  level: LEVEL,
  format: combine(timestamp(), myFormat),
  transports: [
    new DailyRotateFile({
      filename: './logs/%DATE%-service.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '5d',
      maxSize: 10000000,
    }),
  ],
});

export { serviceLogger };
