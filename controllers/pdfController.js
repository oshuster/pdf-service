import { logResponse } from "../config/logConfig.js";
import { generatePdfService } from "../services/pdfServices/generatePdfService.js";

export const pdfController = async (req, res) => {
  try {
    // Викликаємо сервіс для генерації PDF і ZIP архіву
    const zipFilePath = await generatePdfService(req);

    // Сетаємо хідери для завантаження архіву
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.body.docName || "document"}.zip"`
    );

    // Відправляємо ZIP файл
    res.sendFile(zipFilePath, (err) => {
      if (err) {
        console.error("Помилка при відправці архіву:", err);
        res.status(500).send("Помилка при відправці архіву");
      } else {
        logResponse(
          `ZIP file created and sent: ${req.body.docName || "document"}.zip`
        );
      }
    });
  } catch (error) {
    console.error("Помилка при генерації ZIP:", error);
    res.status(500).send("Помилка при генерації архіву");
  }
};
