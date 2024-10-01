import { serviceLogger } from "../config/logConfig.js";
import HttpError from "./HttpError.js";
import fsPromises from "fs/promises";

export const findFileByPattern = async (directory, pattern) => {
  try {
    const files = await fsPromises.readdir(directory);
    const file = files.find((file) => pattern.test(file));
    console.log(file);
    return file;
  } catch (err) {
    serviceLogger.error(`Помилка при читанні каталогу: ${err}`);
    throw HttpError(500, "Помилка при читанні каталогу");
  }
};
