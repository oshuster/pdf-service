import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fsPromises from "fs/promises";
import { generateHtmlCss } from "../../middlewares/generateHtmlCss.js";
import archiver from "archiver";
import { serviceLogger } from "../../config/logConfig.js";
import { logError } from "../../config/logError.js";
import { combineStylesForAll } from "../../helpers/combineStylesForAll.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateZipService = async ({ body, browser, uuid }) => {
  let page;
  try {
    const htmlContent = decodeURIComponent(body.html);
    const docNames = body.docName;

    // Пошук файлів стилів
    const stylesDir = path.resolve(__dirname, "../../../styles/all-pdf-styles");
    const combinedStyles = await combineStylesForAll(docNames, stylesDir);

    if (!combinedStyles) {
      throw new Error("Не знайдено стилів для акту");
    }

    page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const { htmlFilePath, cssFilePath } = await generateHtmlCss(
      htmlContent,
      combinedStyles,
      docNames,
      uuid
    );

    await page.addStyleTag({ content: combinedStyles });

    // Створюємо каталог output, якщо він не існує
    const outputDir = path.resolve(__dirname, "../../../output");
    await fsPromises.mkdir(outputDir, { recursive: true });

    const pdfFilePath = path.join(outputDir, `${docNames[0]}-${uuid}.pdf`);
    await page.pdf({
      path: pdfFilePath,
      landscape: body.landscape || false,
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await page.close();
    serviceLogger.debug(`PDF згенеровано: ${pdfFilePath}`);

    // Створення ZIP архіву
    const zipFilePath = path.join(outputDir, `${docNames[0]}-${uuid}.zip`);
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
      archive.file(htmlFilePath, { name: `${docNames[0]}.html` });
      archive.file(cssFilePath, { name: `${docNames[0]}.css` });
      archive.file(pdfFilePath, { name: `${docNames[0]}.pdf` });

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
    logError(error, null, "Помилка при генерації PDF або архіву");
    console.error("Помилка при генерації PDF або архіву:", error);
    throw new Error("Помилка при генерації PDF або архіву");
  }
};
