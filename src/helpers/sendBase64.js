import { serviceLogger } from '../config/logConfig.js';

export const sendPdfAsBase64 = async (req, res, pdfBuffer) => {
  const fileName =
    req.body.docType !== undefined
      ? req.body.docType
      : req.body.docName || 'document';

  const base64Pdf = pdfBuffer.toString('base64');
  res.status(200).json({ pdfBase64: base64Pdf });

  serviceLogger.info(`PDF created and sent for act: ${fileName}`);
};
