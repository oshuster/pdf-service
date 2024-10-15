import "dotenv/config";
import { logError } from "../config/logError.js";
import { sendZipFile } from "../helpers/sendZipFile.js";
import { generateZipService } from "../services/pdfServices/generateZipActService.js";
import { sendPdfAsBase64 } from "../helpers/sendBase64.js";
import { generatePdfService } from "../services/pdfServices/generatePdfService.js";

export const pdfController = async (req, res) => {
  try {
    // statment for ZIP
    if (req.body.zip) {
      // Генерація ZIP архіву та отримання всіх шляхів до файлів
      const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
        await generateZipService(req);

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
      // statment PDF
      sendPdfAsBase64(req, res, pdfBuffer);
    }
  } catch (error) {
    logError(error, req, "Помилка при генерації PDF");
    console.error("Помилка при генерації PDF:", error);
    res.status(500).send("Помилка при генерації PDF");
  }
};
