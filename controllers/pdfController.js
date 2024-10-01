import { logResponse } from "../config/logConfig.js";
import { cleanupFiles } from "../services/fileServices/cleanupFilesService.js";
import { generatePdfService } from "../services/pdfServices/generatePdfService.js";

export const pdfController = async (req, res) => {
  try {
    // Генерація ZIP архіву та отримання всіх шляхів до файлів
    const { zipFilePath, htmlFilePath, cssFilePath, pdfFilePath } =
      await generatePdfService(req);

    // Сетаємо заголовки для завантаження ZIP файлу
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.body.docName || "document"}.zip"`
    );

    // Відправка ZIP файлу
    res.sendFile(zipFilePath, (err) => {
      if (err) {
        console.error("Помилка при відправці архіву:", err);
        res.status(500).send("Помилка при відправці архіву");
      } else {
        logResponse(
          `ZIP file created and sent: ${req.body.docName || "document"}.zip`
        );

        // Видаляємо файли після успішної відправки
        const filesToDelete = [
          zipFilePath,
          htmlFilePath,
          cssFilePath,
          pdfFilePath,
        ];
        cleanupFiles(filesToDelete).catch((error) => {
          console.error("Помилка при видаленні тимчасових файлів:", error);
        });
      }
    });
  } catch (error) {
    console.error("Помилка при генерації ZIP:", error);
    res.status(500).send("Помилка при генерації архіву");
  }
};
