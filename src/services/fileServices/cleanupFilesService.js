import fsPromises from "fs/promises";
import { serviceLogger } from "../../config/logConfig.js";

export const cleanupFiles = async (filePaths) => {
  try {
    for (const filePath of filePaths) {
      await fsPromises.unlink(filePath);
    }
    serviceLogger.debug(`Тимчасові файли успішно видалено: ${filePaths}`);
  } catch (error) {
    console.error("Помилка при видаленні тимчасових файлів:", error);
  }
};
23;
