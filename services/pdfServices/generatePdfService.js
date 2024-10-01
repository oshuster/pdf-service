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

const fileExists = async (filePath) => {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
};

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

    const docStylePattern = new RegExp(`^Document${docName}-\\w+\\.css$`);
    const localStylesDoc = await findFileByPattern(stylesDir, docStylePattern);

    if (!localStylesMain || !localStylesDoc) {
      throw HttpError(404, "Файл стилів не знайдено");
    }

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
      docName
    );

    await page.addStyleTag({ content: combinedStyles });

    const pdfFilePath = path.resolve(__dirname, `../../output/${docName}.pdf`);
    await page.pdf({
      path: pdfFilePath,
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await page.close();

    // перевірка наявності файлів
    if (
      !(await fileExists(htmlFilePath)) ||
      !(await fileExists(cssFilePath)) ||
      !(await fileExists(pdfFilePath))
    ) {
      throw new Error("Один або кілька файлів не знайдені перед архівуванням.");
    }

    // Створення ZIP архіву
    const zipFilePath = path.resolve(__dirname, `../../output/${docName}.zip`);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Підключаємо архіватор до потоку
    archive.pipe(output);

    // Додаємо файли до архіву
    archive.file(htmlFilePath, { name: `${docName}.html` });
    archive.file(cssFilePath, { name: `${docName}.css` });
    archive.file(pdfFilePath, { name: `${docName}.pdf` });

    output.on("close", () => {
      console.log(`Архів ${zipFilePath} успішно створено`);
    });

    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn("Архіватор не знайшов деякі файли", err);
      } else {
        throw err;
      }
    });

    archive.on("error", (err) => {
      throw new Error(`Помилка архівування: ${err.message}`);
    });

    // Закінчуємо архівування і очікуємо завершення
    await archive.finalize();

    return zipFilePath;
  } catch (error) {
    console.error("Помилка при генерації PDF або архіву:", error);
    throw HttpError(500, "Помилка при генерації PDF або архіву");
  }
};
