import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { serviceLogger } from './config/logConfig.js';
import {
  browserLauncher,
  closeBrowser,
  getPage,
  releasePage,
} from './services/pdfServices/browserLauncher.js';
import { logError } from './config/logError.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { pdfDocumentController } from './controllers/pdfDocumentsController.js';
import { loadStylesIntoCache } from './utils/cacheStyles.js';

const GRPC_PORT = process.env.GRPC_PORT || 50051;

// Завантажуємо gRPC-схему
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../proto/pdf.proto');
const docStylesDir = path.resolve(__dirname, '../styles/documents');
const allStylesDir = path.resolve(__dirname, '../styles/all-pdf-styles');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// Оголошення типів для pdfProto
/** @type {{ PdfService: grpc.ServiceDefinition }} */
const pdfProto = grpcObject.pdf;

if (!pdfProto || !pdfProto.PdfService) {
  throw new Error('gRPC PdfService not found in the loaded package.');
}

// Функція для отримання сторінки перед викликом контролера
const withPage = async (call, callback, handler) => {
  let page;
  try {
    page = await getPage(); // Отримуємо сторінку
    call.request.page = page; // Передаємо її в запит
    await handler(call, callback); // Викликаємо контролер
  } catch (error) {
    logError(error, null, 'Error handling request with page');
    callback({ code: grpc.status.INTERNAL, message: 'Error handling request' });
  } finally {
    if (page) releasePage(page); // Завжди звільняємо сторінку після обробки
  }
};

// Функція для ініціалізації сервера
async function main() {
  try {
    await browserLauncher();
    await loadStylesIntoCache(docStylesDir);
    await loadStylesIntoCache(allStylesDir);

    const server = new grpc.Server();

    server.addService(pdfProto.PdfService.service, {
      GeneratePdf: (call, callback) =>
        withPage(call, callback, pdfDocumentController),
    });

    server.bindAsync(
      `0.0.0.0:${GRPC_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          logError(err, null, 'Failed to start gRPC server');
          console.error('Failed to start gRPC server', err);
          process.exit(1);
        }
        serviceLogger.info(`gRPC Server is running on port ${port}`);
        console.log(`gRPC Server is running on port ${port}`);
      }
    );

    process.on('SIGINT', async () => {
      try {
        console.log('\nShutting down server...');
        serviceLogger.info('Shutting down server...');
        await closeBrowser();
        console.log('Server closed.');
        serviceLogger.info('Server closed.');
        process.exit(0);
      } catch (error) {
        logError(error, null, 'Error while shutting down');
        console.error('Error while shutting down:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    logError(error, null, 'Failed to launch Puppeteer');
    console.error('Failed to launch Puppeteer:', error);
    process.exit(1);
  }
}

main();
