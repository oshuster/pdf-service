import { serviceLogger } from "../config/logConfig.js";
import { cleanupFiles } from "../services/fileServices/cleanupFilesService.js";
import "dotenv/config";
import { generateZipService } from "../services/pdfServices/generateZipService.js";

const CLEAR_TEMP = process.env.CLEAR_TEMP || "true";

export const zipController = async (req, res) => {
  try {
    // Генерація ZIP архіву та отримання всіх шляхів до файлів
    const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
      await generateZipService(req);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.body.docName || "document"}.zip"`
    );

    // Відправка ZIP файлу
    res.sendFile(zipFilePath, (err) => {
      if (err) {
        serviceLogger.error(`Помилка при відправці архіву: ${err}`);
        console.error("Помилка при відправці архіву:", err);
        res.status(500).send("Помилка при відправці архіву");
      } else {
        serviceLogger.info(
          `ZIP file created and sent: ${req.body.docName || "document"}.zip`
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
            serviceLogger.error(
              `Помилка при видаленні тимчасових файлів: ${error}`
            );
            console.error("Помилка при видаленні тимчасових файлів:", error);
          });
        }
      }
    });
  } catch (error) {
    serviceLogger.error(`Помилка при генерації ZIP: ${error}`);
    console.error("Помилка при генерації ZIP:", error);
    res.status(500).send("Помилка при генерації архіву");
  }
};
