import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { serviceLogger } from "../../config/logConfig.js";
import { logError } from "../../config/logError.js";
import { combineStylesForAll } from "../../helpers/combineStylesForAll.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePdfService = async ({ body, browser }) => {
  let page;
  try {
    const htmlContent = decodeURIComponent(body.html);
    const { docType } = body;

    // Пошук файлів стилів
    const stylesDir = path.resolve(__dirname, "../../../styles/all-pdf-styles");
    const combinedStyles = await combineStylesForAll(docType, stylesDir);

    if (!combinedStyles) {
      throw new Error("Не знайдено стилів для файлу");
    }

    page = await browser.newPage();

    // Функція для підвантаження зображень з файлової системи
    await page.exposeFunction("getBase64Image", async (imageName) => {
      const imagePath = path.resolve(__dirname, "../../../images", imageName);

      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
      } else {
        throw new Error(`Зображення ${imageName} не знайдено`);
      }
    });

    // Заміна шляхів до зображень у браузерному контексті
    const updatedHtmlContent = await page.evaluate(async (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const images = doc.querySelectorAll("img");

      for (const img of images) {
        const src = img.getAttribute("src");
        if (src && src.startsWith("/images/")) {
          const imageName = src.split("/").pop(); // отримуємо назву файлу
          const base64Image = await window.getBase64Image(imageName);
          img.setAttribute("src", base64Image);
        }
      }

      return doc.documentElement.outerHTML;
    }, htmlContent);

    // Встановлюємо оновлений HTML контент
    await page.setContent(updatedHtmlContent, { waitUntil: "networkidle0" });
    await page.addStyleTag({ content: combinedStyles });

    // Генерація PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: body.landscape || false,
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await page.close();
    serviceLogger.debug(`PDF згенеровано для файлу: ${docType}`);

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
