import 'dotenv/config';
import { logError } from '../config/logError.js';
import { sendZipFile } from '../helpers/sendZipFile.js';
import { sendPdfAsBase64 } from '../helpers/sendBase64.js';
import { generatePdfService } from '../services/pdfServices/generatePdfService.js';
import { generateZipService } from '../services/pdfServices/generateZipService.js';

export const pdfController = async (req, res) => {
  try {
    // statment for ZIP
    if (req.body.zip) {
      // Генерація ZIP архіву та отримання всіх шляхів до файлів
      const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
        await generateZipService(req, false);

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
      const pdfBuffer = await generatePdfService(req);
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
