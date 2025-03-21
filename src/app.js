import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import { serviceLogger } from './config/logConfig.js';
import pdfServiceRouter from './routes/pdfServiceRouter.js';
import {
  browserLauncher,
  getPage,
  releasePage,
  closeBrowser, // Додано
} from './services/pdfServices/browserLauncher.js';
import { logError } from './config/logError.js';
import { swaggerDocs } from './config/swaggerConfig.js';
import { loadStylesIntoCache } from './utils/cacheStyles.js';
import path from 'path';
import { fileURLToPath } from 'url';

const HTTP_PORT = process.env.PORT || 3344;
const BASE_URL = process.env.BASE_URL || '/';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
  const docStylesDir = path.resolve(__dirname, '../styles/documents');
  const allStylesDir = path.resolve(__dirname, '../styles/all-pdf-styles');

  try {
    await browserLauncher();
    await loadStylesIntoCache(docStylesDir);
    await loadStylesIntoCache(allStylesDir);

    app.use(morgan('tiny'));
    app.use(
      cors({
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
      })
    );
    app.use(express.json({ limit: '3mb' }));
    app.use(express.urlencoded({ limit: '3mb', extended: true }));

    // Передаємо сторінку в `req`
    app.use(
      BASE_URL,
      async (req, res, next) => {
        try {
          req.page = await getPage();
          res.on('finish', () => {
            if (req.page) releasePage(req.page); // Переконуємось, що `req.page` існує
          });
          next();
        } catch (error) {
          next(error);
        }
      },
      pdfServiceRouter
    );

    swaggerDocs(app, HTTP_PORT);

    app.use((_, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    app.use((err, req, res, next) => {
      const { status = 500, message = 'Server error' } = err;
      res.status(status).json({ message });
    });

    const server = app.listen(HTTP_PORT, () => {
      serviceLogger.info(`HTTP Server is running on port ${HTTP_PORT}`);
      console.log(`HTTP Server is running on port ${HTTP_PORT}`);
    });

    // Закриваємо браузер при завершенні процесу
    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      serviceLogger.info('Shutting down server...');
      await closeBrowser();
      server.close(() => {
        console.log('Server closed.');
        serviceLogger.info('Server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    logError(error, null, 'Failed to start the server');
    console.error('Failed to start the server', error);
  }
};

startServer();
