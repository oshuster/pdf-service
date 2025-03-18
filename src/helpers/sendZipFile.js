import { serviceLogger } from '../config/logConfig.js';
import { logError } from '../config/logError.js';
import { cleanupFiles } from '../services/fileServices/cleanupFilesService.js';
import fs from 'fs/promises';

/**
 * Відправка ZIP через gRPC
 * @param {Object} req
 * @param {Function} callback
 * @param {string} zipFilePath
 * @param {Array<string>} filesToDelete
 */
export const sendZipFileGrpc = async (
  req,
  callback,
  zipFilePath,
  filesToDelete
) => {
  try {
    // Читаємо ZIP-файл у buffer
    const zipBuffer = await fs.readFile(zipFilePath);

    serviceLogger.info(`ZIP file created and sent: ${zipFilePath}`);

    // Очищення тимчасових файлів
    const CLEAR_TEMP = process.env.CLEAR_TEMP || 'true';
    if (CLEAR_TEMP === 'true') {
      cleanupFiles(filesToDelete).catch((error) => {
        logError(error, null, 'Error deleting temporary files');
        console.error('Error deleting temporary files:', error);
      });
    }

    // Повертаємо ZIP як `bytes`
    callback(null, { pdfData: zipBuffer });
  } catch (error) {
    logError(error, req, 'Error sending archive');
    console.error('Error sending archive:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Error sending archive',
    });
  }
};
