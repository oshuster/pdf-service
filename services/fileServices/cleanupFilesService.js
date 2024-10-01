import fsPromises from "fs/promises";

export const cleanupFiles = async (filePaths) => {
  try {
    for (const filePath of filePaths) {
      await fsPromises.unlink(filePath);
    }
    console.log("Тимчасові файли успішно видалено.");
  } catch (error) {
    console.error("Помилка при видаленні тимчасових файлів:", error);
  }
};
