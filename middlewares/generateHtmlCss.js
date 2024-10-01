import "dotenv/config";
import path from "path";
import fs from "fs/promises"; // Використання асинхронного fs/promises
import { fileURLToPath } from "url";

// Еквівалент для __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateHtmlCss = async (html, styles, docName, uuid) => {
  console.log("UUID HTML:", uuid);
  const outputDir = path.resolve(__dirname, "../output");
  await fs.mkdir(outputDir, { recursive: true });

  const htmlFilePath = path.resolve(
    __dirname,
    `../output/${docName}-${uuid}.html`
  );
  const cssFilePath = path.resolve(
    __dirname,
    `../output/${docName}-${uuid}.css`
  );

  // Структура HTML документа
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Generated HTML</title>
      <link rel="stylesheet" href="${docName}.css">
    </head>
    <body>
      ${html}
    </body>
    </html>`;

  // Записуємо HTML файл
  await fs.writeFile(htmlFilePath, fullHtml, "utf8");

  // Записуємо CSS файл
  await fs.writeFile(cssFilePath, styles, "utf8");

  return { htmlFilePath, cssFilePath };
};
