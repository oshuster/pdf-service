import { serviceLogger } from "../../config/logConfig.js";
import HttpError from "../../helpers/HttpError.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fsPromises from "fs/promises";
import { generateHtmlCss } from "../../middlewares/generateHtmlCss.js";
import archiver from "archiver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findFileByPattern = async (directory, pattern) => {
  try {
    const files = await fsPromises.readdir(directory);
    return files.find((file) => pattern.test(file));
  } catch (err) {
    serviceLogger.error(`Помилка при читанні каталогу: ${err}`);
    throw HttpError(500, "Помилка при читанні каталогу");
  }
};

export const generatePdfService = async ({ body, browser }) => {
  let page;
  try {
    const htmlContent = decodeURIComponent(body.html);
    const docName = body.docName;
    // const stylesContent = decodeURIComponent(body.styles || "");

    // Пошук файлу стилів для index
    const stylesDir = path.resolve(__dirname, "../../styles");
    const mainStylePattern = /^index-\w+\.css$/;
    const localStylesMain = await findFileByPattern(
      stylesDir,
      mainStylePattern
    );

    // Пошук файлу стилів для document на основі docName
    const docStylePattern = new RegExp(`^Document${docName}-\\w+\\.css$`);
    const localStylesDoc = await findFileByPattern(stylesDir, docStylePattern);

    if (!localStylesMain || !localStylesDoc) {
      throw HttpError(404, "Файл стилів не знайдено");
    }

    // Шляхи до файлів стилів
    const localStylesMainPath = path.join(stylesDir, localStylesMain);
    const localStylesDocPath = path.join(stylesDir, localStylesDoc);

    serviceLogger.debug(
      `Знайдено стилі: ${localStylesMainPath}, ${localStylesDocPath}`
    );

    page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    let localMainStyles = "";
    let localDocStyles = "";
    localMainStyles = await fsPromises.readFile(localStylesMainPath, "utf-8");
    localDocStyles = await fsPromises.readFile(localStylesDocPath, "utf-8");

    // Об'єднуємо локальні стилі та стилі з запиту
    const combinedStyles = `${localMainStyles}\n${localDocStyles}`;

    const { htmlFilePath, cssFilePath } = await generateHtmlCss(
      htmlContent,
      combinedStyles,
      docName
    );

    await page.addStyleTag({ content: combinedStyles });

    console.log("pdf file path: ", __dirname);

    const pdfFilePath = path.resolve(__dirname, `../../output/${docName}.pdf`);

    await page.pdf({
      path: pdfFilePath,
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    // Закриваємо сторінку
    await page.close();

    // E:\QA\nodeJS\pdf-service\services\pdfServices
    // Створення архіву ZIP
    const zipFilePath = path.resolve(
      __dirname,
      `../../output/${body.docName}.zip`
    );
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Обробка подій архівування
    output.on("close", () => {
      res.download(zipFilePath); // Відправляємо архів клієнту
    });
    archive.on("error", (err) => {
      throw new HttpError(500, `Помилка при архівуванні: ${err.message}`);
    });

    // Підключаємо поток архіву до файлу
    archive.pipe(output);

    // Додаємо файли до архіву
    archive.file(htmlFilePath, { name: `${body.docName}.html` });
    archive.file(cssFilePath, { name: `${body.docName}.css` });
    archive.file(pdfFilePath, { name: `${body.docName}.pdf` });

    // Завершуємо архівування
    await archive.finalize();
  } catch (error) {
    console.error("Помилка при генерації PDF або архіву:", error);
    throw HttpError(500, "Помилка при генерації PDF або архіву");
  }
};
