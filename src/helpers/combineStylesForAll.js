import path from "path";
import fsPromises from "fs/promises";
import { findFileByPattern } from "./findFileByPattern.js";
import { serviceLogger } from "../config/logConfig.js";

export const combineStylesForAll = async (docNames, stylesDir) => {
  let combinedStyles = "";
  const fileName = docNames[0] || "act-1";

  // ACT STYLES
  const actStylePattern = new RegExp(`${fileName}.css$`, "i");
  const localStylesAct = await findFileByPattern(stylesDir, actStylePattern);

  if (localStylesAct) {
    const localStylesActPath = path.join(stylesDir, localStylesAct);
    const actStyles = await fsPromises.readFile(localStylesActPath, "utf-8");
    combinedStyles += `\n${actStyles}`;
    serviceLogger.debug(
      `Додано стилі для файлу ${fileName}: ${localStylesAct}`
    );
  } else {
    serviceLogger.warn(`Стилі для файлу ${fileName} не знайдено.`);
  }

  return combinedStyles;
};
