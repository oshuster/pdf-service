import 'dotenv/config';
import { logError } from '../config/logError.js';
import { generatePdfDocumentService } from '../services/pdfServices/generatePdfDocumentService.js';

export const pdfDocumentController = async (call, callback) => {
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
    logError(error, req, 'Error generating PDF');
    console.error('Error generating PDF:', error);
    return callback({
      code: grpc.status.INTERNAL,
      message: 'Error generating PDF',
    });
  }
};
