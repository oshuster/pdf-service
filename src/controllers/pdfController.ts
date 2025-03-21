import 'dotenv/config';
import * as grpc from '@grpc/grpc-js';

import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { UniPdfRequestWithPage } from '../types/types';
import { PdfResponse } from '../generated/pdf';
import { generatePdfService } from '../services/pdfServices/generatePdfService';
import { serviceLogger } from '../config/logConfig';

export const pdfController = async (
  call: ServerUnaryCall<UniPdfRequestWithPage, PdfResponse>,
  callback: sendUnaryData<PdfResponse>
) => {
  const req = call.request;
  try {
    // statment for ZIP
    // if (req.body.zip) {
    //   // Генерація ZIP архіву та отримання всіх шляхів до файлів
    //   const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
    //     await generateZipService(req, false);

    //   // Відправка ZIP файлу
    //   sendZipFile(
    //     req,
    //     res,
    //     zipFilePath,
    //     htmlFilePath,
    //     cssFilePath,
    //     pdfFilePath
    //   );
    // } else {
    const pdfBuffer = await generatePdfService(req);
    const base64Pdf = pdfBuffer.toString('base64');

    return callback(null, { base64Data: base64Pdf });
  } catch (error) {
    serviceLogger.error(
      `Error generating PDF\n REQUEST: ${req} \n ERROR: ${error}`
    );
    console.error('Error generating PDF:', error);
    return callback({
      code: grpc.status.INTERNAL,
      message: 'Error generating PDF',
    });
  }
};
