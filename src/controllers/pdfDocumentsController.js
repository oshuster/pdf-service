import 'dotenv/config';
import { logError } from '../config/logError.js';
import { generatePdfDocumentService } from '../services/pdfServices/generatePdfDocumentService.js';
import { sendZipFile } from '../helpers/sendZipFile.js';
import { sendPdfAsBase64 } from '../helpers/sendBase64.js';
import { generateZipService } from '../services/pdfServices/generateZipService.js';

export const pdfDocumentController = async (req, res) => {
  try {
    if (req.body.zip) {
      const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
        await generateZipService(req, true);
      // Відправка ZIP файлу
      sendZipFile(
        req,
        res,
        zipFilePath,
        htmlFilePath,
        cssFilePath,
        pdfFilePath
      );
    } else {
      const pdfBuffer = await generatePdfDocumentService(req);
      sendPdfAsBase64(req, res, pdfBuffer);

      // for POSTMAN
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');

      // res.send(pdfBuffer);
    }
  } catch (error) {
    logError(error, req, 'Error generating PDF');
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
};
