import path from "path";
import { fileURLToPath } from "url";
import { serviceLogger } from "../../config/logConfig.js";
import { combineStylesForDocuments } from "../../helpers/combineStylesForDocuments.js";
import { logError } from "../../config/logError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePdfDocumentService = async ({ body, browser }) => {
  let page;
  try {
    const htmlContent = decodeURIComponent(body.html);
    const docNames = body.docName;

    // Пошук файлів стилів
    const stylesDir = path.resolve(__dirname, "../../styles/documents");

    const combinedStyles = await combineStylesForDocuments(docNames, stylesDir);

    if (!combinedStyles) {
      throw new Error("Не знайдено стилів для документів");
    }

    page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await page.addStyleTag({ content: combinedStyles });

    // Генеруємо PDF у вигляді буфера
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: body.landscape || false,
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await page.close();
    serviceLogger.debug(`PDF згенеровано для документа: ${docNames[0]}`);

    const buffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    return buffer;
  } catch (error) {
    logError(error, null, "Помилка при генерації PDF");
    console.error("Помилка при генерації PDF:", error);
    throw new Error("Помилка при генерації PDF");
  }
};
