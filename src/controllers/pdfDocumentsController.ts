import 'dotenv/config';
import * as grpc from '@grpc/grpc-js';

import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { generatePdfDocumentService } from '../services/pdfServices/generatePdfDocumentService';
import { serviceLogger } from '../config/logConfig';
import { DocPdfRequestWithPage } from '../types/types';
import { PdfResponse } from '../generated/pdf';

export const pdfDocumentController = async (
  call: ServerUnaryCall<DocPdfRequestWithPage, PdfResponse>,
  callback: sendUnaryData<PdfResponse>
) => {
  const req = call.request;
  try {
    // if (req.zip) {
    //   const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
    //     await generateFilesForZip(req, true);
    //   // Відправка ZIP файлу
    //   const filesToDelete = [
    //     zipFilePath,
    //     htmlFilePath,
    //     cssFilePath,
    //     pdfFilePath,
    //   ];
    //   return sendZipFileGrpc(req, callback, zipFilePath, filesToDelete);
    // } else {

    const pdfBuffer = await generatePdfDocumentService(req);
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
