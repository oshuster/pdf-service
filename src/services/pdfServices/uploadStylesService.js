import path from 'path';
import fs from 'fs-extra';
import moment from 'moment';
import { fileURLToPath } from 'url';
import { serviceLogger } from '../../config/logConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stylesDirDocs = path.resolve(__dirname, '../../../styles/documents');
const stylesDirAll = path.resolve(__dirname, '../../../styles/all-pdf-styles');
const backupDir = path.resolve(__dirname, '../../../styles_bak');

// Функція визначення директорії за назвою файлу
export function getTargetDirectory(filename) {
  if (/^DocumentF\d+/.test(filename)) {
    return stylesDirDocs;
  } else if (/^\d+\.css$/.test(filename)) {
    return stylesDirAll;
  } else {
    serviceLogger.warn(`Неправильний формат файлу: ${filename}`);
    throw new Error('Неправильний формат файлу');
  }
}

// Функція для резервного копіювання старих файлів
export async function backupOldFiles(targetDir, filename) {
  const baseNameMatch = filename.match(/^(DocumentF\d+)/);

  if (!baseNameMatch) {
    serviceLogger.info(`Файл ${filename} не підходить під формат пошуку`);
    return;
  }

  const baseName = baseNameMatch[1]; // `DocumentF0102003`
  const allFiles = await fs.readdir(targetDir);

  // Знаходимо всі файли, що починаються з тієї ж базової назви
  const matchingFiles = allFiles.filter(
    (file) => file.startsWith(baseName) && file.endsWith('.css')
  );

  if (matchingFiles.length === 0) {
    serviceLogger.info(`Не знайдено попередніх версій файлу ${filename}`);
    return;
  }

  await fs.ensureDir(backupDir);

  for (const file of matchingFiles) {
    const oldFilePath = path.join(targetDir, file);
    const timestamp = moment().format('YYYY-MM-DD_HH-mm');
    const backupFilePath = path.join(backupDir, `${timestamp}_${file}`);

    try {
      await fs.move(oldFilePath, backupFilePath, { overwrite: true });
      serviceLogger.info(`Файл ${file} переміщено в backup: ${backupFilePath}`);
    } catch (error) {
      serviceLogger.error(`Помилка переміщення ${file} в backup: ${error}`);
    }
  }
}

// Функція для обробки завантаження файлу
export async function uploadStylesService(file) {
  if (!file) {
    throw new Error('Файл не було надано');
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
      `Файл ${originalname} успішно збережено в ${targetFilePath}`
    );
    return { message: 'Файл успішно завантажено', fileName: originalname };
  } catch (error) {
    serviceLogger.error(`Помилка завантаження файлу ${originalname}: ${error}`);
    throw new Error('Помилка при завантаженні файлу');
  }
}
