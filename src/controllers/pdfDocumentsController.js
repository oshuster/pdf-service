import "dotenv/config";
import { logError } from "../config/logError.js";
import { generatePdfDocumentService } from "../services/pdfServices/generatePdfDocumentService.js";
import { generateZipDocumetsService } from "../services/pdfServices/generateZipDocumentsService.js";
import { sendZipFile } from "../helpers/sendZipFile.js";
import { sendPdfAsBase64 } from "../helpers/sendBase64.js";

export const pdfDocumentController = async (req, res) => {
  try {
    if (req.body.zip) {
      const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
        await generateZipDocumetsService(req);

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
    }
  } catch (error) {
    logError(error, req, "Помилка при генерації PDF");
    console.error("Помилка при генерації PDF:", error);
    res.status(500).send("Помилка при генерації PDF");
  }
};
