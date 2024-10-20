import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { serviceLogger } from "../config/logConfig.js";

// Еквівалент для __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateHtmlCss = async (html, styles, docType, uuid) => {
  const outputDir = path.resolve(__dirname, "../output");
  await fs.mkdir(outputDir, { recursive: true });

  const fileName = typeof docType === "string" ? docType : docType[0];

  const htmlFilePath = path.resolve(
    __dirname,
    `../output/${fileName}-${uuid}.html`
  );
  const cssFilePath = path.resolve(
    __dirname,
    `../output/${fileName}-${uuid}.css`
  );

  // Структура HTML документа
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Generated HTML</title>
      <link rel="stylesheet" href="${fileName}.css">
    </head>
    <body>
      ${html}
    </body>
    </html>`;

  // Записуємо HTML файл
  await fs.writeFile(htmlFilePath, fullHtml, "utf8");

  // Записуємо CSS файл
  await fs.writeFile(cssFilePath, styles, "utf8");

  serviceLogger.debug(`Створенні файли: \n
    html: ${htmlFilePath}\n
    css: ${cssFilePath}`);
  return { htmlFilePath, cssFilePath };
};
