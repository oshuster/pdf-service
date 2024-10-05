import "dotenv/config";
import { serviceLogger } from "../config/logConfig.js";
import { cleanupFiles } from "../services/fileServices/cleanupFilesService.js";
import { logError } from "../config/logError.js";
import { generateZipActService } from "../services/pdfServices/generateZipActService.js";

const CLEAR_TEMP = process.env.CLEAR_TEMP || "true";

export const actInZipController = async (req, res) => {
  try {
    // Генерація ZIP архіву та отримання всіх шляхів до файлів
    const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
      await generateZipActService(req);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.body.docName[0] || "document"}.zip"`
    );

    // Відправка ZIP файлу
    res.sendFile(zipFilePath, (err) => {
      if (err) {
        logError(err, req, "Помилка при відправці архіву");
        console.error("Помилка при відправці архіву:", err);
        res.status(500).send("Помилка при відправці архіву");
      } else {
        serviceLogger.info(
          `ZIP file created and sent: ${req.body.docName[0] || "document"}.zip`
        );

        if (CLEAR_TEMP === "true") {
          // Видаляємо файли після успішної відправки
          const filesToDelete = [
            zipFilePath,
            htmlFilePath,
            cssFilePath,
            pdfFilePath,
          ];
          cleanupFiles(filesToDelete).catch((error) => {
            logError(err, req, "Помилка при видаленні тимчасових файлів:");
            console.error("Помилка при видаленні тимчасових файлів:", error);
          });
        }
      }
    });
  } catch (error) {
    logError(error, req, "Помилка при генерації ZIP");
    console.error("Помилка при генерації ZIP:", error);
    res.status(500).send("Помилка при генерації архіву");
  }
};
