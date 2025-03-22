import { generatePdfFromHtml } from '@oshuster/pdf-generator';
import { serviceLogger } from '../../config/logConfig';
import { UniPdfRequestWithPage } from '../../types/types';

export const generatePdfService = async (req: UniPdfRequestWithPage) => {
  try {
    const buffer = await generatePdfFromHtml(req);

    return buffer;
  } catch (error) {
    serviceLogger.error(`Error generating PDF ${error}`);
    console.error('Error generating PDF:', error);
    throw new Error('Error generating PDF');
  }
};
