// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';
// import fsPromises from 'fs/promises';
// import { generateHtmlCss } from '../../middlewares/generateHtmlCss.js';
// import archiver from 'archiver';
// import { serviceLogger } from '../../config/logConfig.js';
// import { logError } from '../../config/logError.js';
// import { getCachedStylesForType } from '../../utils/getCachedStyles.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const generateZipService = async ({ body, page, uuid }) => {
//   try {
//     const htmlContent = decodeURIComponent(body.html);
//     const { docType } = body;

//     // Пошук файлів стилів
//     const combinedStyles = getCachedStylesForType(docType);

//     if (!combinedStyles) {
//       throw new Error('No document styles found');
//     }

//     await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//     const { htmlFilePath, cssFilePath } = await generateHtmlCss(
//       htmlContent,
//       combinedStyles,
//       docType,
//       uuid
//     );

//     await page.addStyleTag({ content: combinedStyles });

//     // Створюємо каталог output, якщо він не існує
//     const outputDir = path.resolve(__dirname, '../../../output');
//     await fsPromises.mkdir(outputDir, { recursive: true });

//     const pdfFilePath = path.join(outputDir, `${docType}-${uuid}.pdf`);
//     await page.pdf({
//       path: pdfFilePath,
//       landscape: body.landscape || false,
//       format: 'A4',
//       printBackground: true,
//       margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
//     });

//     serviceLogger.debug(`PDF generated: ${pdfFilePath}`);

//     // Створення ZIP архіву
//     const zipFilePath = path.join(outputDir, `${docType}-${uuid}.zip`);
//     await new Promise((resolve, reject) => {
//       const output = fs.createWriteStream(zipFilePath);
//       const archive = archiver('zip', { zlib: { level: 9 } });

//       output.on('close', () => {
//         console.log(`Archiving complete, size: ${archive.pointer()} байт`);
//         resolve();
//       });

//       archive.on('error', (err) => {
//         console.error('Archiving error:', err);
//         reject(err);
//       });

//       archive.pipe(output);

//       // Додаємо файли до архіву
//       archive.file(htmlFilePath, { name: `${docType}.html` });
//       archive.file(cssFilePath, { name: `${docType}.css` });
//       archive.file(pdfFilePath, { name: `${docType}.pdf` });

//       archive.finalize();
//       serviceLogger.info(`IP files created: ${zipFilePath}`);
//     });

//     return {
//       zipFilePath,
//       htmlFilePath,
//       cssFilePath,
//       pdfFilePath,
//     };
//   } catch (error) {
//     logError(error, null, 'Error generating PDF or archive');
//     console.error('Error generating PDF or archive:', error);
//     throw new Error('Error generating PDF or archive');
//   }
// };

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { generateHtmlCss } from '../../middlewares/generateHtmlCss.js';
import archiver from 'archiver';
import { serviceLogger } from '../../config/logConfig.js';
import { logError } from '../../config/logError.js';
import {
  getCachedStylesForType,
  getCachedStylesForDocuments,
} from '../../utils/getCachedStyles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 0 - акт
 1 - Рахунок на оплату
 2 - Накладна
 3 - Інвойс
 4 - Реквізит на оплату в податкової
 5 - деталі торгової марки
 6 - книга обліку
 7 - облік товарів
 8 - реквізити банківського рахунку
  */

/**
 * Генерує PDF, HTML, CSS та архівує в ZIP
 * @param {Object} params
 * @param {Object} params.body - Запит користувача
 * @param {import('playwright').Page} params.page - Сторінка браузера Playwright
 * @param {string} params.uuid - Унікальний ідентифікатор файлів
 * @param {boolean} params.isMultiDoc - Визначає, обробляється один чи кілька документів
 * @returns {Promise<Object>} - Шляхи до згенерованих файлів
 */
export const generateZipService = async (
  { body, page, uuid },
  isMultiDoc = false
) => {
  try {
    const htmlContent = decodeURIComponent(body.html);
    const docKey = isMultiDoc ? body.docName : body.docType;

    // Пошук файлів стилів
    const combinedStyles = isMultiDoc
      ? getCachedStylesForDocuments(docKey)
      : getCachedStylesForType(docKey);

    if (!combinedStyles) {
      throw new Error('No document styles found');
    }

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    const { htmlFilePath, cssFilePath } = await generateHtmlCss(
      htmlContent,
      combinedStyles,
      docKey,
      uuid
    );

    await page.addStyleTag({ content: combinedStyles });

    // Створюємо каталог output, якщо він не існує
    const outputDir = path.resolve(__dirname, '../../../output');
    await fsPromises.mkdir(outputDir, { recursive: true });

    const pdfFilePath = path.join(outputDir, `${docKey}-${uuid}.pdf`);
    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      landscape: body.landscape || false,
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    serviceLogger.debug(`PDF generated: ${pdfFilePath}`);

    // Створення ZIP архіву
    const zipFilePath = path.join(outputDir, `${docKey}-${uuid}.zip`);
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`Archiving complete, size: ${archive.pointer()} байт`);
        resolve();
      });

      archive.on('error', (err) => {
        console.error('Archiving error:', err);
        reject(err);
      });

      archive.pipe(output);

      // Додаємо файли до архіву
      archive.file(htmlFilePath, { name: `${docKey}.html` });
      archive.file(cssFilePath, { name: `${docKey}.css` });
      archive.file(pdfFilePath, { name: `${docKey}.pdf` });

      archive.finalize();
      serviceLogger.info(`ZIP files created: ${zipFilePath}`);
    });

    return {
      zipFilePath,
      htmlFilePath,
      cssFilePath,
      pdfFilePath,
    };
  } catch (error) {
    logError(error, null, 'Error generating PDF or archive');
    console.error('Error generating PDF or archive:', error);
    throw new Error('Error generating PDF or archive');
  }
};
