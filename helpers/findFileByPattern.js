import { serviceLogger } from "../config/logConfig.js";
import HttpError from "./HttpError.js";
import fsPromises from "fs/promises";

export const findFileByPattern = async (directory, pattern) => {
  try {
    const files = await fsPromises.readdir(directory);
    return files.find((file) => pattern.test(file));
  } catch (err) {
    serviceLogger.error(`Помилка при читанні каталогу: ${err}`);
    throw HttpError(500, "Помилка при читанні каталогу");
  }
};
