import { serviceLogger } from '../../config/logConfig';
import { DocPdfRequestWithPage } from '../../types/types';
import { getCachedStylesForDocuments } from '../../utils/getCachedStyles';

export const generatePdfDocumentService = async (
  req: DocPdfRequestWithPage
) => {
  try {
    const htmlContent = decodeURIComponent(req.html);
    const docNames = req.docName;
    const { page, landscape } = req;

    // Пошук файлів стилів
    const combinedStyles = getCachedStylesForDocuments(docNames);

    if (!combinedStyles) {
      throw new Error('No document styles found');
    }

    const styledHtml = `<style>${combinedStyles}</style>${htmlContent}`;
    await page.setContent(styledHtml, {
      waitUntil: 'networkidle',
    });

    // Генеруємо PDF у вигляді буфера
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: landscape || false,
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    serviceLogger.debug(`PDF generated for document: ${docNames[0]}`);

    const buffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    return buffer;
  } catch (error) {
    serviceLogger.error(`Error generating PDF ${error}`);
    console.error('Error generating PDF:', error);
    throw new Error('Error generating PDF');
  }
};
