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

export const generatePdfService = async ({ body, browser, uuid }) => {
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

    const { htmlFilePath, cssFilePath } = await generateHtmlCss(
      htmlContent,
      combinedStyles,
      docName,
      uuid
    );

    await page.addStyleTag({ content: combinedStyles });

    // Створюємо каталог output, якщо він не існує
    const outputDir = path.resolve(__dirname, "../../output");
    await fsPromises.mkdir(outputDir, { recursive: true });

    const pdfFilePath = path.join(outputDir, `${docName}-${uuid}.pdf`);
    await page.pdf({
      path: pdfFilePath,
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await page.close();
    serviceLogger.debug(`PDF згенеровано: ${pdfFilePath}`);

    // Створення ZIP архіву
    const zipFilePath = path.join(outputDir, `${docName}-${uuid}.zip`);
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        console.log(`Архівування завершено, розмір: ${archive.pointer()} байт`);
        resolve();
      });

      archive.on("error", (err) => {
        console.error("Помилка при архівуванні:", err);
        reject(err);
      });

      archive.pipe(output);

      // Додаємо файли до архіву
      archive.file(htmlFilePath, { name: `${docName}.html` });
      archive.file(cssFilePath, { name: `${docName}.css` });
      archive.file(pdfFilePath, { name: `${docName}.pdf` });

      archive.finalize();
      serviceLogger.info(`ZIP-ахів створено: ${zipFilePath}`);
    });

    return {
      zipFilePath,
      htmlFilePath,
      cssFilePath,
      pdfFilePath,
    };
  } catch (error) {
    console.error("Помилка при генерації PDF або архіву:", error);
    serviceLogger.error(`"Помилка при генерації PDF або архіву: ${error}`);
    throw new Error("Помилка при генерації PDF або архіву");
  }
};
