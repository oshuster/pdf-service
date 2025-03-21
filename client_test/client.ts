import dotenv from 'dotenv';
dotenv.config();
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import fs from 'fs';
import path from 'path';
import { F0103308, zero } from './testData/docPdfData';

const GRPC_PORT: number = Number(process.env.GRPC_PORT) || 50051;

// Завантажуємо gRPC-схему
const PROTO_PATH = path.resolve(__dirname, '../proto/pdf.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const pdfProto = protoDescriptor.pdf as {
  PdfService: grpc.ServiceClientConstructor;
};

console.log('CLIENT_PROTO_PATH :', PROTO_PATH);
console.log('GRPC_PORT :', GRPC_PORT);

// Підключаємося до сервера
const client = new pdfProto.PdfService(
  `localhost:${GRPC_PORT}`,
  grpc.credentials.createInsecure()
) as unknown as {
  GeneratePdf: (
    request: {
      docName: string[];
      landscape?: boolean;
      zip?: boolean;
      html: string;
    },
    callback: (
      error: grpc.ServiceError | null,
      response: { base64Data: string }
    ) => void
  ) => void;
  GeneratePdfForAll: (
    request: {
      docType: number;
      landscape?: boolean;
      zip?: boolean;
      html: string;
    },
    callback: (
      error: grpc.ServiceError | null,
      response: { base64Data: string }
    ) => void
  ) => void;
};

// Функція для збереження отриманого PDF/ZIP
const saveFile = (fileBuffer: Buffer, fileName: string) => {
  fs.writeFileSync(fileName, fileBuffer);
  console.log(`Файл збережено: ${fileName}`);
};

// Функція для тестування генерації PDF
const testGenerateDocumentPdf = async () => {
  const requestData = {
    docName: ['F0103308'],
    landscape: false,
    zip: false,
    html: F0103308,
  };

  client.GeneratePdf(requestData, (err, response) => {
    if (err) {
      console.error('Помилка:', err);
      return;
    }

    console.log('PDF отримано у Base64');
    const pdfBuffer = Buffer.from(response.base64Data, 'base64');
    saveFile(pdfBuffer, 'F0103308.pdf');
  });
};

const testGenerateUniPdf = async () => {
  const requestData = {
    docType: 0,
    landscape: false,
    zip: false,
    html: zero,
  };

  client.GeneratePdfForAll(requestData, (err, response) => {
    if (err) {
      console.error('Помилка:', err);
      return;
    }

    console.log('PDF отримано у Base64');
    const pdfBuffer = Buffer.from(response.base64Data, 'base64');
    saveFile(pdfBuffer, '0.pdf');
  });
};

testGenerateDocumentPdf();
testGenerateUniPdf();
