import { serviceLogger } from '../config/logConfig.js';
import { logError } from '../config/logError.js';
import { cleanupFiles } from '../services/fileServices/cleanupFilesService.js';

const CLEAR_TEMP = process.env.CLEAR_TEMP || 'true';

export const sendZipFile = async (
  req,
  res,
  zipFilePath,
  htmlFilePath,
  cssFilePath,
  pdfFilePath
) => {
  const zipName =
    req.body.docType !== undefined
      ? req.body.docType
      : req.body.docName || 'document';

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${zipName}-${req.uuid}.zip"`
  );

  res.sendFile(zipFilePath, (err) => {
    if (err) {
      logError(err, req, 'Error sending archive');
      res.status(500).send('Error sending archive');
    } else {
      serviceLogger.info(
        `ZIP file created and sent: ${zipName}-${req.uuid}.zip`
      );

      if (CLEAR_TEMP === 'true') {
        // Видаляємо файли після успішної відправки
        const filesToDelete = [
          zipFilePath,
          htmlFilePath,
          cssFilePath,
          pdfFilePath,
        ];
        cleanupFiles(filesToDelete).catch((error) => {
          logError(err, req, 'Error deleting temporary files');
          console.error('Error deleting temporary files:', error);
        });
      }
    }
  });
};
