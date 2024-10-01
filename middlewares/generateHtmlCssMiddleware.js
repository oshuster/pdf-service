import "dotenv/config";
import path from "path";
import fs from "fs/promises"; // Використання асинхронного fs/promises
import { fileURLToPath } from "url";

// Еквівалент для __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateHtmlCssMiddleware = async (req, res, next) => {
  const DEBUG_HTML_MODE = process.env.DEBUG_HTML_MODE || false;

  console.log(DEBUG_HTML_MODE);
  if (DEBUG_HTML_MODE === "true") {
    const { html, styles, docName } = req.body;

    const decodedHtml = decodeURIComponent(html);
    const decodedStyles = decodeURIComponent(styles);

    // Перевіряємо, чи є дані для генерації файлів
    if (!html || !styles || !docName) {
      return res
        .status(400)
        .send("HTML, CSS контент або ім'я документа не надано");
    }

    // Створюємо директорію, якщо вона не існує
    const generatedDir = path.join(__dirname, "generated");
    try {
      await fs.mkdir(generatedDir, { recursive: true });
    } catch (err) {
      return res
        .status(500)
        .send("Помилка при створенні директорії для файлів");
    }

    const htmlFilePath = path.join(generatedDir, `${docName}.html`);
    const cssFilePath = path.join(generatedDir, "styles.css");

    console.log(htmlFilePath);

    // Структура HTML документа
    const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Generated HTML</title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>
      ${decodedHtml}
    </body>
    </html>
  `;

    // Читаємо локальний файл стилів
    const localStylesPath = path.resolve(
      __dirname,
      "../styles/index-E7Lu8ddP.css"
    );

    console.log(">>>", localStylesPath);
    let localStyles = "";
    try {
      localStyles = await fs.readFile(localStylesPath, "utf-8");
    } catch (err) {
      console.error(`Помилка при читанні локальних стилів: ${err}`);
    }

    // Об'єднуємо локальні стилі та стилі з запиту
    const combinedStyles = `${localStyles}\n${decodedStyles}`;

    // Записуємо HTML-файл
    try {
      await fs.writeFile(htmlFilePath, fullHtml);
    } catch (err) {
      return res.status(500).send("Помилка при записі HTML файлу");
    }

    // Записуємо CSS-файл
    try {
      await fs.writeFile(cssFilePath, combinedStyles);
      next();
    } catch (err) {
      return res.status(500).send("Помилка при записі CSS файлу");
    }
  } else {
    next();
  }
};
