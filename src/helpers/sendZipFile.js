import { serviceLogger } from "../config/logConfig.js";
import { logError } from "../config/logError.js";
import { cleanupFiles } from "../services/fileServices/cleanupFilesService.js";

const CLEAR_TEMP = process.env.CLEAR_TEMP || "true";

export const sendZipFile = async (
  req,
  res,
  zipFilePath,
  htmlFilePath,
  cssFilePath,
  pdfFilePath
) => {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${req.body.docType}.zip"`
  );

  res.sendFile(zipFilePath, (err) => {
    if (err) {
      logError(err, req, "Помилка при відправці архіву");
      res.status(500).send("Помилка при відправці архіву");
    } else {
      serviceLogger.info(`ZIP file created and sent: ${req.body.docType}.zip`);

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
};
