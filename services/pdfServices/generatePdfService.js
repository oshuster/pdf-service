import { serviceLogger } from "../../config/logConfig.js";
import HttpError from "../../helpers/HttpError.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePdfService = async ({ body, browser }) => {
  let page;

  try {
    const htmlContent = decodeURIComponent(body.html);
    const stylesContent = decodeURIComponent(body.styles || "");

    serviceLogger.debug(`DECODED HTML ${htmlContent}`);
    serviceLogger.debug(`DECODED STYLES ${stylesContent}`);

    page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // Читаємо локальний файл стилів
    // const localStylesPath = path.resolve(
    //   __dirname,
    //   "../../styles/index-E7Lu8ddP.css"
    // );
    // let localStyles = "";
    // try {
    //   localStyles = await fs.readFile(localStylesPath, "utf-8");
    // } catch (err) {
    //   serviceLogger.error(`Помилка при читанні локальних стилів: ${err}`);
    // }

    // // Об'єднуємо локальні стилі та стилі з запиту
    // const combinedStyles = `${localStyles}\n${stylesContent}`;

    // Додаємо поєднані стилі на сторінку
    if (combinedStyles.length > 10) {
      await page.addStyleTag({ content: stylesContent });
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Помилка при генерації PDF:", error);
    throw HttpError(500, "Помилка при генерації PDF");
  } finally {
    // Закриваємо сторінку
    if (page) {
      await page.close();
    }
  }
};
