import { serviceLogger } from "../../config/logConfig.js";
import HttpError from "../../helpers/HttpError.js";

export const generatePdfService = async ({ body, browser }) => {
  let page;

  try {
    const htmlContent = decodeURIComponent(body.html);
    const stylesContent = decodeURIComponent(body.styles || "");

    serviceLogger.debug(`DECODED HTML ${htmlContent}`);
    serviceLogger.debug(`DECODED STYLES ${stylesContent}`);

    page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    if (stylesContent.length > 10) {
      await page.addStyleTag({ content: stylesContent });
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Помилка при генерації PDF:", error);
    throw HttpError(500, "Помилка при генерації PDF");
  } finally {
    // Закриваємо сторінку
    if (page) {
      await page.close();
    }
  }
};
