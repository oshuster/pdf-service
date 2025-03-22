import { generateDocumentPdfFromHtml } from '@oshuster/pdf-generator';
import { serviceLogger } from '../../config/logConfig';
import { DocPdfRequestWithPage } from '../../types/types';

export const generatePdfDocumentService = async (
  req: DocPdfRequestWithPage
) => {
  try {
    const buffer = await generateDocumentPdfFromHtml(req);

    return buffer;
  } catch (error) {
    serviceLogger.error(`Error generating PDF ${error}`);
    console.error('Error generating PDF:', error);
    throw new Error('Error generating PDF');
  }
};
