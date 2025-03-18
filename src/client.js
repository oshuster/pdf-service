import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { F0103308 } from './testData/docPdfData.js';

// Завантажуємо gRPC-схему
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../proto/pdf.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const pdfProto = grpc.loadPackageDefinition(packageDefinition).pdf;

// Підключаємося до сервера
const client = new pdfProto.PdfService(
  'localhost:50051', // Замініть на адресу сервера, якщо він не локальний
  grpc.credentials.createInsecure()
);

// Функція для збереження отриманого PDF/ZIP
const saveFile = (fileBuffer, fileName) => {
  fs.writeFileSync(fileName, fileBuffer);
  console.log(`Файл збережено: ${fileName}`);
};

// Функція для тестування генерації PDF
const testGeneratePdf = async () => {
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
    saveFile(pdfBuffer, 'output.pdf');
  });
};

testGeneratePdf();
