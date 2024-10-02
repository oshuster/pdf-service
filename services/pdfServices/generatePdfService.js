import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fsPromises from "fs/promises";
import { generateHtmlCss } from "../../middlewares/generateHtmlCss.js";
import archiver from "archiver";
import { findFileByPattern } from "../../helpers/findFileByPattern.js";
import { serviceLogger } from "../../config/logConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePdfService = async ({ body, browser }) => {
  let page;
  try {
    const htmlContent = decodeURIComponent(body.html);
    const docName = body.docName;

    // Пошук файлів стилів
    const stylesDir = path.resolve(__dirname, "../../styles");
    const mainStylePattern = /^index-\w+\.css$/;
    const localStylesMain = await findFileByPattern(
      stylesDir,
      mainStylePattern
    );
    serviceLogger.debug(`Знайдено основний файл стилів: ${localStylesMain}`);

    const docStylePattern = new RegExp(`Document${docName}.*\\.css$`, "i");
    const localStylesDoc = await findFileByPattern(stylesDir, docStylePattern);
    serviceLogger.debug(
      `Знайдено файл стилів для документу: ${localStylesDoc}`
    );

    if (!localStylesMain || !localStylesDoc) {
      throw new Error("Файл стилів не знайдено");
    }

    // Створення шляху до файлів
    const localStylesMainPath = path.join(stylesDir, localStylesMain);
    const localStylesDocPath = path.join(stylesDir, localStylesDoc);

    page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const localMainStyles = await fsPromises.readFile(
      localStylesMainPath,
      "utf-8"
    );
    const localDocStyles = await fsPromises.readFile(
      localStylesDocPath,
      "utf-8"
    );
    const combinedStyles = `${localMainStyles}\n${localDocStyles}`;

    await page.addStyleTag({ content: combinedStyles });

    // Генеруємо PDF у вигляді буфера
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await page.close();
    serviceLogger.debug(`PDF згенеровано для документа: ${docName}`);

    return pdfBuffer;
  } catch (error) {
    console.error("Помилка при генерації PDF:", error);
    serviceLogger.error(`Помилка при генерації PDF: ${error}`);
    throw new Error("Помилка при генерації PDF");
  }
};
