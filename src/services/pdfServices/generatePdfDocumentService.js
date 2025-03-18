import { serviceLogger } from '../../config/logConfig.js';
import { logError } from '../../config/logError.js';
import { getCachedStylesForDocuments } from '../../utils/getCachedStyles.js';

export const generatePdfDocumentService = async (req) => {
  try {
    const htmlContent = decodeURIComponent(req.html);
    const docNames = req.docName;

    // Пошук файлів стилів
    const combinedStyles = getCachedStylesForDocuments(docNames);

    if (!combinedStyles) {
      throw new Error('No document styles found');
    }

    const styledHtml = `<style>${combinedStyles}</style>${htmlContent}`;
    await req.page.setContent(styledHtml, { waitUntil: 'networkidle0' });

    // Генеруємо PDF у вигляді буфера
    const pdfBuffer = await req.page.pdf({
      format: 'A4',
      landscape: req.landscape || false,
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    serviceLogger.debug(`PDF generated for document: ${docNames[0]}`);

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
