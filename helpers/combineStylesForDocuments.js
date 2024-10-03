import path from "path";
import fsPromises from "fs/promises";
import { findFileByPattern } from "./findFileByPattern.js";
import { serviceLogger } from "../config/logConfig.js";

export const combineStylesForDocuments = async (docNames, stylesDir) => {
  let combinedStyles = "";

  // Основний файл стилів
  const mainStylePattern = /^index-\w+\.css$/;
  const localStylesMain = await findFileByPattern(stylesDir, mainStylePattern);
  if (localStylesMain) {
    const localStylesMainPath = path.join(stylesDir, localStylesMain);
    const mainStyles = await fsPromises.readFile(localStylesMainPath, "utf-8");
    combinedStyles += mainStyles;
    serviceLogger.debug(`Додано основні стилі: ${localStylesMain}`);
  }

  // Пошук стилів для кожного документа з масиву
  for (const docName of docNames) {
    const docStylePattern = new RegExp(`Document${docName}.*\\.css$`, "i");
    const localStylesDoc = await findFileByPattern(stylesDir, docStylePattern);
    if (localStylesDoc) {
      const localStylesDocPath = path.join(stylesDir, localStylesDoc);
      const docStyles = await fsPromises.readFile(localStylesDocPath, "utf-8");
      combinedStyles += `\n${docStyles}`;
      serviceLogger.debug(
        `Додано стилі для документа ${docName}: ${localStylesDoc}`
      );
    } else {
      serviceLogger.warn(`Стилі для документа ${docName} не знайдено.`);
    }
  }

  return combinedStyles;
};
