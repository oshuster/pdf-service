import dotenv from 'dotenv';
dotenv.config();

import * as grpc from '@grpc/grpc-js';
import { pdfController } from './controllers/pdfController';
import { pdfDocumentController } from './controllers/pdfDocumentsController';
import { ForAllPdfRequest, PdfRequest, PdfResponse } from './generated/pdf';
import { serviceLogger } from './config/logConfig';
import { closeBrowser } from '@oshuster/pdf-generator';

import { initPdfService } from './init/initPdfService';
import { loadProto } from './grpc/protoLoader';
import { withPage } from './grpc/withPage';

const GRPC_PORT: number = Number(process.env.GRPC_PORT) || 50051;

async function main(): Promise<void> {
  try {
    await initPdfService();

    const server: grpc.Server = new grpc.Server();
    const pdfProto = loadProto();

    server.addService(pdfProto.pdf.PdfService.service, {
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
          process.exit(1);
        }
        console.log(`gRPC Server is running on port ${port}`);
      }
    );

    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      await closeBrowser();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start gRPC server:', error);
    process.exit(1);
  }
}

main();
