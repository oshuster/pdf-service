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
    serviceLogger.debug(`Неправильний формат файлу: ${filename}`);
    throw new Error('Неправильний формат файлу');
  }
}

// Функція для резервного копіювання старого файлу за базовим іменем
export async function backupOldFiles(targetDir, filename) {
  const baseNameMatch = filename.match(/^(DocumentF\d+)/);

  if (!baseNameMatch) {
    serviceLogger.debug(`Файл ${filename} не підходить під формат пошуку`);
    console.log(`Файл ${filename} не підходить під формат пошуку`);
    return;
  }

  const baseName = baseNameMatch[1]; // `DocumentF0102003`
  const allFiles = await fs.readdir(targetDir);

  // Фільтруємо файли, які починаються з тієї ж частини
  const matchingFiles = allFiles.filter(
    (file) => file.startsWith(baseName) && file.endsWith('.css')
  );

  if (matchingFiles.length === 0) {
    serviceLogger.debug(`Не знайдено попередніх версій файлу ${filename}`);
    console.log(`Не знайдено попередніх версій файлу ${filename}`);
    return;
  }

  await fs.ensureDir(backupDir);

  for (const file of matchingFiles) {
    const oldFilePath = path.join(targetDir, file);
    const timestamp = moment().format('YYYY-MM-DD_HH-mm');
    const backupFilePath = path.join(backupDir, `${timestamp}_${file}`);

    try {
      await fs.rename(oldFilePath, backupFilePath);
      serviceLogger.debug(
        `Файл ${file} переміщено в backup як ${backupFilePath}`
      );
      console.log(`Файл ${file} переміщено в backup як ${backupFilePath}`);
    } catch (error) {
      serviceLogger.debug(`Помилка переміщення ${file} в backup: ${error}`);
      console.error(`Помилка переміщення ${file} в backup:`, error);
    }
  }
}

// Функція для обробки завантаження файлу
export async function uploadStylesService(file) {
  if (!file) {
    throw new Error('Файл не було надано');
  }

  const { originalname, path: tempPath } = file;

  // Визначаємо, куди зберігати файл
  const targetDir = getTargetDirectory(originalname);
  const targetFilePath = path.join(targetDir, originalname);

  // Резервне копіювання всіх файлів, які починаються з тієї ж базової назви
  await backupOldFiles(targetDir, originalname);

  // Переміщуємо новий файл у відповідну папку
  await fs.ensureDir(targetDir);
  await fs.rename(tempPath, targetFilePath);

  serviceLogger.debug(
    `Файл ${originalname} успішно збережено в ${targetFilePath}`
  );
  console.log(`Файл ${originalname} успішно збережено в ${targetFilePath}`);

  return { message: 'Файл успішно завантажено', fileName: file };
}
