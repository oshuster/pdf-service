import path from "path";
import { fileURLToPath } from "url";
import { serviceLogger } from "../../config/logConfig.js";
import { combineStylesForDocuments } from "../../helpers/combineStylesForDocuments.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePdfService = async ({ body, browser }) => {
  let page;
  try {
    const htmlContent = decodeURIComponent(body.html);
    const docNames = body.docName;

    // Пошук файлів стилів
    const stylesDir = path.resolve(__dirname, "../../styles");

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
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await page.close();
    serviceLogger.debug(`PDF згенеровано для документа: ${docNames[0]}`);

    return pdfBuffer;
  } catch (error) {
    console.error("Помилка при генерації PDF:", error);
    serviceLogger.error(`Помилка при генерації PDF: ${error}`);
    throw new Error("Помилка при генерації PDF");
  }
};
