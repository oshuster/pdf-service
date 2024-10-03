import path from "path";
import fsPromises from "fs/promises";
import { findFileByPattern } from "./findFileByPattern.js";
import { serviceLogger } from "../config/logConfig.js";

export const combineStylesForDocuments = async (docNames, stylesDir) => {
  let combinedStyles = "";

  // RESET STYLES
  const resetStylePattern = /^reset-styles.css$/;
  const localResetStylesMain = await findFileByPattern(
    stylesDir,
    resetStylePattern
  );

  if (localResetStylesMain) {
    const localResetStylesMainPath = path.join(stylesDir, localResetStylesMain);
    const resetStyles = await fsPromises.readFile(
      localResetStylesMainPath,
      "utf-8"
    );

    combinedStyles += resetStyles;
    serviceLogger.debug(`Додано ресет стилі: ${localResetStylesMain}`);
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

  // COMMON-DOCUMENT STYLES
  const commonDocStylePattern = /^common-document.css$/;
  const localCommonDoc = await findFileByPattern(
    stylesDir,
    commonDocStylePattern
  );

  if (localCommonDoc) {
    const localCommonDocPath = path.join(stylesDir, localCommonDoc);
    const commonDocStyles = await fsPromises.readFile(
      localCommonDocPath,
      "utf-8"
    );

    combinedStyles += `\n${commonDocStyles}`;
    serviceLogger.debug(`Додано common-document стилі: ${localCommonDoc}`);
  } else {
    serviceLogger.warn(`common-styles.css не знайдено`);
  }

  return combinedStyles;
};
