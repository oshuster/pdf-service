import dotenv from 'dotenv';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { serviceLogger } from './config/logConfig';
import { Page } from 'playwright';
import {
  browserLauncher,
  closeBrowser,
  getPage,
  releasePage,
} from './services/pdfServices/browserLauncher';
import { loadStylesIntoCache } from './utils/cacheStyles';
import { pdfDocumentController } from './controllers/pdfDocumentsController';
import { ForAllPdfRequest, PdfRequest, PdfResponse } from './generated/pdf';
import { pdfController } from './controllers/pdfController';

const GRPC_PORT: number = Number(process.env.GRPC_PORT) || 50051;

// Завантажуємо gRPC-схему
const PROTO_PATH = path.join(__dirname, `../proto/pdf.proto`);
const docStylesDir = path.resolve(__dirname, '../styles/documents');
const allStylesDir = path.resolve(__dirname, '../styles/all-pdf-styles');

console.log('PROTO_PATH :', PROTO_PATH);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const pdfProto = protoDescriptor.pdf as {
  PdfService: { service: grpc.ServiceDefinition<unknown> };
};

const withPage = async <T extends PdfRequest | ForAllPdfRequest>(
  call: grpc.ServerUnaryCall<T, PdfResponse>,
  callback: grpc.sendUnaryData<PdfResponse>,
  handler: (
    call: grpc.ServerUnaryCall<T & { page: Page }, PdfResponse>,
    callback: grpc.sendUnaryData<PdfResponse>
  ) => Promise<void>
): Promise<void> => {
  let page: Page | undefined;
  try {
    page = await getPage();
    if (!page) {
      throw new Error('Error on getting page');
    }
    (call.request as T & { page: Page }).page = page;
    await handler(
      call as grpc.ServerUnaryCall<T & { page: Page }, PdfResponse>,
      callback
    );
  } catch (error) {
    serviceLogger.error(`Error handling request with page ${error}`);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Error handling request',
    } as grpc.ServiceError);
  } finally {
    if (page) releasePage(page);
  }
};
async function main(): Promise<void> {
  try {
    await browserLauncher();
    await loadStylesIntoCache(docStylesDir);
    await loadStylesIntoCache(allStylesDir);

    const server: grpc.Server = new grpc.Server();

    server.addService(pdfProto.PdfService.service, {
      GeneratePdf: (
        call: grpc.ServerUnaryCall<PdfRequest, PdfResponse>,
        callback: grpc.sendUnaryData<PdfResponse>
      ) => withPage(call, callback, pdfDocumentController),

      GeneratePdfForAll: (
        call: grpc.ServerUnaryCall<ForAllPdfRequest, PdfResponse>,
        callback: grpc.sendUnaryData<PdfResponse>
      ) => withPage(call, callback, pdfController),
    });

    server.bindAsync(
      `0.0.0.0:${GRPC_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      (err: Error | null, port: number) => {
        if (err) {
          serviceLogger.error(`Failed to start gRPC server ${err}`);
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
        serviceLogger.error(`Error while shutting down ${error}`);
        console.error('Error while shutting down:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    serviceLogger.error(`Failed to launch Playwright ${error}`);
    console.error('Failed to launch Playwright:', error);
    process.exit(1);
  }
}

main();
