import winston from "winston";
import "dotenv/config";
import DailyRotateFile from "winston-daily-rotate-file";

const LEVEL = process.env.LOG_LEVEL || "info";

// Налаштування форматів логування
const { combine, timestamp, printf } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Логер для загальних повідомлень
const serviceLogger = winston.createLogger({
  level: LEVEL,
  format: combine(timestamp(), myFormat),
  transports: [
    new DailyRotateFile({
      filename: "./logs/%DATE%-service.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "5d",
      maxSize: 10000000,
    }),
  ],
});

// Логер для помилок
const errorLogger = winston.createLogger({
  level: "error",
  format: combine(timestamp(), myFormat),
  transports: [
    new DailyRotateFile({
      filename: "./logs/%DATE%-error.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "5d",
      maxSize: 10000000,
    }),
  ],
});

// Логер для запитів та відповідей
const webLogger = winston.createLogger({
  level: LEVEL,
  format: combine(timestamp(), myFormat),
  transports: [
    new DailyRotateFile({
      filename: "./logs/%DATE%-web.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "5d",
      maxSize: 10000000,
    }),
  ],
});

// Логування запиту
export const logRequest = (req, _, next) => {
  const { method, url, body } = req;
  const message = `[REQUEST >>>] ${method} ${url} ${JSON.stringify(body)}\n\n`;
  webLogger.info(message);

  next();
};

// Логування відповіді
export const logResponse = (status) => {
  // const { statusCode, data } = res
  const message = `[<<< RESPONSE] ${status}\n\n`;
  webLogger.info(message);
};

export { serviceLogger, errorLogger, webLogger };
