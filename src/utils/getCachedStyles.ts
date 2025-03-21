import { serviceLogger } from '../config/logConfig';
import { stylesCache } from './cacheStyles';

/**
 * Отримує закешовані стилі для масиву документів.
 */
export const getCachedStylesForDocuments = (docNames: string[]): string => {
  let combinedStyles = '';

  // Додаємо спільні стилі, якщо вони є
  const resetStyles = stylesCache.get('reset-styles.css') || '';
  const commonStyles = stylesCache.get('common-document.css') || '';
  combinedStyles += resetStyles;

  if (resetStyles) serviceLogger.debug('Added reset-styles.css');
  if (commonStyles) serviceLogger.debug('Added common-document.css');

  docNames.forEach((docName) => {
    const matchingStyles = [...stylesCache.keys()].filter((file) =>
      file.includes(docName)
    );

    if (matchingStyles.length > 0) {
      matchingStyles.forEach((styleFile) => {
        combinedStyles += stylesCache.get(styleFile) || '';
        serviceLogger.debug(
          `Added styles for document ${docName}: ${styleFile}`
        );
      });
    } else {
      serviceLogger.warn(`No styles found for document: ${docName}`);
    }
  });

  combinedStyles += commonStyles;

  return combinedStyles;
};

/**
 * Отримує закешовані стилі для певного типу документа.
 */
export const getCachedStylesForType = (docType: number): string => {
  const styleKey = `${docType}.css`;
  const combinedStyles = stylesCache.get(styleKey) || '';

  if (combinedStyles) {
    serviceLogger.debug(`Loaded styles: ${styleKey}`);
  } else {
    serviceLogger.warn(`No styles found for: ${styleKey}`);
  }

  return combinedStyles;
};
