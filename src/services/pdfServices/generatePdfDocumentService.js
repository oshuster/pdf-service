import { serviceLogger } from '../../config/logConfig.js';
import { logError } from '../../config/logError.js';
import { performance } from 'perf_hooks';
import { getCachedStylesForDocuments } from '../../utils/getCachedStyles.js';

export const generatePdfDocumentService = async ({ body, page }) => {
  const startTime = performance.now();
  try {
    const htmlContent = decodeURIComponent(body.html);
    const docNames = body.docName;

    console.log(`[START] Generating PDF for document: ${docNames.join(', ')}`);

    // Пошук файлів стилів
    const styleStartTime = performance.now();
    const combinedStyles = getCachedStylesForDocuments(docNames);
    const styleEndTime = performance.now();

    if (!combinedStyles) {
      throw new Error('No document styles found');
    }

    console.log(
      `[STYLES] Loaded in ${(styleEndTime - styleStartTime).toFixed(2)}ms`
    );

    const pageStartTime = performance.now();

    const styledHtml = `<style>${combinedStyles}</style>${htmlContent}`;
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    const pageEndTime = performance.now();

    console.log(
      `[PAGE] Rendered in ${(pageEndTime - pageStartTime).toFixed(2)}ms`
    );

    // Генеруємо PDF у вигляді буфера
    const pdfStartTime = performance.now();
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: body.landscape || false,
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });
    const pdfEndTime = performance.now();

    console.log(
      `[PDF] Generated in ${(pdfEndTime - pdfStartTime).toFixed(2)}ms`
    );

    serviceLogger.debug(`PDF generated for document: ${docNames[0]}`);

    const endTime = performance.now(); // Завершення вимірювання
    const totalTime = (endTime - startTime).toFixed(2);
    console.log(`[SUCCESS] PDF for ${docNames[0]} generated in ${totalTime}ms`);

    const buffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    return buffer;
  } catch (error) {
    logError(error, null, 'Error generating PDF');
    console.error('Error generating PDF:', error);
    throw new Error('Error generating PDF');
  }
};
