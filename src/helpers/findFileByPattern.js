import { logError } from "../config/logError.js";
import HttpError from "./HttpError.js";
import fsPromises from "fs/promises";

export const findFileByPattern = async (directory, pattern) => {
  try {
    const files = await fsPromises.readdir(directory);
    const file = files.find((file) => pattern.test(file));
    return file;
  } catch (err) {
    logError(err, null, "Помилка при читанні каталогу");
    throw HttpError(500, "Помилка при читанні каталогу");
  }
};
