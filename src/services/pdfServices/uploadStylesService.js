import path from 'path';
import fs from 'fs-extra';
import moment from 'moment';
import { fileURLToPath } from 'url';
import { serviceLogger } from '../../config/logConfig.js';
import { loadStylesIntoCache } from '../../utils/cacheStyles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stylesDirDocs = path.resolve(__dirname, '../../../styles/documents');
const stylesDirAll = path.resolve(__dirname, '../../../styles/all-pdf-styles');
const backupDir = path.resolve(__dirname, '../../../styles_bak');
const documentRegexp =
  /^DocumentF\d+(-v\d+\.\d+\.\d+(_\d{2}\.\d{2}\.\d{4})?)?\.css$/;

// Функція визначення директорії за назвою файлу
function getTargetDirectory(filename) {
  if (documentRegexp.test(filename)) {
    return stylesDirDocs;
  } else if (/^\d+\.css$/.test(filename)) {
    return stylesDirAll;
  } else {
    serviceLogger.warn(`Incorrect file format: ${filename}`);
    throw new Error('Incorrect file format');
  }
}

// Функція для резервного копіювання старих файлів для всіх типів
async function backupOldFiles(targetDir, filename) {
  let baseName;

  if (documentRegexp.test(filename)) {
    baseName = filename.match(/^(DocumentF\d+)/)?.[1]; // `DocumentF000000`
  } else if (/^\d+\.css$/.test(filename)) {
    baseName = filename.match(/^(\d+)/)?.[1]; // `12`
  }

  if (!baseName) {
    serviceLogger.info(`The file ${filename} does not match the search format`);
    return;
  }

  const allFiles = await fs.readdir(targetDir);

  let matchingFiles = [];

  if (documentRegexp.test(filename)) {
    // Знайти всі файли, які починаються на `DocumentF00000`
    matchingFiles = allFiles.filter(
      (file) => file.startsWith(baseName) && file.endsWith('.css')
    );
  } else if (/^\d+\.css$/.test(filename)) {
    // **Чітко шукаємо тільки `1.css`, `1-v1.css`, `1-v2.css`**
    matchingFiles = allFiles.filter(
      (file) =>
        file === `${baseName}.css` ||
        file.match(new RegExp(`^${baseName}-v\\d+\\.css$`))
    );
  }

  if (matchingFiles.length === 0) {
    serviceLogger.info(`No previous versions of file ${filename} found`);
    return;
  }

  await fs.ensureDir(backupDir);

  for (const file of matchingFiles) {
    const oldFilePath = path.join(targetDir, file);
    const timestamp = moment().format('YYYY-MM-DD_HH-mm');
    const backupFilePath = path.join(backupDir, `${timestamp}_${file}`);

    try {
      await fs.move(oldFilePath, backupFilePath, { overwrite: true });
      serviceLogger.info(`File ${file} moved to backup: ${backupFilePath}`);
    } catch (error) {
      serviceLogger.error(`Error moving ${file} to backup: ${error}`);
    }
  }
}

// Функція для обробки завантаження файлу
export async function uploadStylesService(file) {
  if (!file) {
    throw new Error('File not provided');
  }

  const { originalname, path: tempPath } = file;

  try {
    // Визначаємо, куди зберігати файл
    const targetDir = getTargetDirectory(originalname);
    const targetFilePath = path.join(targetDir, originalname);

    // Резервне копіювання всіх файлів, які починаються з тієї ж базової назви
    await backupOldFiles(targetDir, originalname);

    // Переміщуємо новий файл у відповідну папку
    await fs.ensureDir(targetDir);
    await fs.move(tempPath, targetFilePath, { overwrite: true });

    serviceLogger.info(
      `File ${originalname} successfully saved to ${targetFilePath}`
    );

    await loadStylesIntoCache(targetDir);

    serviceLogger.info(`Cache updated after file upload: ${originalname}`);

    return { message: 'File successfully uploaded', fileName: originalname };
  } catch (error) {
    serviceLogger.error(`File upload error ${originalname}: ${error}`);
    throw new Error('Error while uploading file');
  }
}
