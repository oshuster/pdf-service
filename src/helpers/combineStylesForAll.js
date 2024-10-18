import path from "path";
import fsPromises from "fs/promises";
import { findFileByPattern } from "./findFileByPattern.js";
import { serviceLogger } from "../config/logConfig.js";

export const combineStylesForAll = async (docType, stylesDir) => {
  let combinedStyles = "";

  // ACT STYLES
  const actStylePattern = new RegExp(`${docType}.css$`, "i");
  const localStylesAct = await findFileByPattern(stylesDir, actStylePattern);

  if (localStylesAct) {
    const localStylesActPath = path.join(stylesDir, localStylesAct);
    const actStyles = await fsPromises.readFile(localStylesActPath, "utf-8");
    combinedStyles += `\n${actStyles}`;
    serviceLogger.debug(`Додано стилі для файлу ${docType}: ${localStylesAct}`);
  } else {
    serviceLogger.warn(`Стилі для файлу ${docType} не знайдено.`);
  }

  return combinedStyles;
};
