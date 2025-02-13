import path from 'path';
import fsPromises from 'fs/promises';
import { serviceLogger } from '../config/logConfig.js';

// Глобальний кеш для всіх стилів
export const stylesCache = new Map();

/**
 * Зчитує всі CSS-файли у вказаній директорії та кешує їх у пам’яті.
 * @param {string} stylesDir - Шлях до каталогу стилів.
 */
export const loadStylesIntoCache = async (stylesDir) => {
  try {
    const files = await fsPromises.readdir(stylesDir);
    let cachedFiles = [];

    for (const file of files) {
      if (file.endsWith('.css')) {
        const filePath = path.join(stylesDir, file);
        const fileContent = await fsPromises.readFile(filePath, 'utf-8');
        stylesCache.set(file, fileContent);
        cachedFiles.push(file);
      }
    }

    // Логування всього списку закешованих файлів
    if (cachedFiles.length > 0) {
      serviceLogger.info(`Cached ${cachedFiles.length} CSS files:`);
      cachedFiles.forEach((file) => serviceLogger.info(`- ${file}`));
    } else {
      serviceLogger.warn(`No CSS files found in directory ${stylesDir}`);
    }

    serviceLogger.info(`All styles are loaded into the cache.`);
  } catch (error) {
    serviceLogger.error(`Error caching styles: ${error.message}`);
  }
};
