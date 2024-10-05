import "dotenv/config";
import { serviceLogger } from "../config/logConfig.js";
import { logError } from "../config/logError.js";
import { generatePdfActService } from "../services/pdfServices/generatePdfActService.js";

export const actController = async (req, res) => {
  try {
    const pdfBuffer = await generatePdfActService(req);

    // Конвертуємо PDF у Base64
    const base64Pdf = pdfBuffer.toString("base64");

    // Відправка Base64 PDF у відповіді
    res.status(200).json({
      pdfBase64: base64Pdf,
    });

    serviceLogger.info(
      `PDF created and sent for act: ${req.body.docName || "act"}`
    );
  } catch (error) {
    logError(error, req, "Помилка при генерації PDF");
    console.error("Помилка при генерації PDF:", error);
    res.status(500).send("Помилка при генерації PDF");
  }
};
