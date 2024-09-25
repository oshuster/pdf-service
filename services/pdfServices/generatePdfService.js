import HttpError from "../../helpers/HttpError.js"

export const generatePdfService = async ({ body, browser }) => {
  let page // Оголошуємо змінну один раз перед блоком try

  try {
    const htmlContent = decodeURIComponent(body.html)
    const stylesContent = decodeURIComponent(body.styles)

    page = await browser.newPage() // Створюємо сторінку, використовуючи вже оголошену змінну

    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    await page.addStyleTag({ content: stylesContent })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
    })

    return pdfBuffer
  } catch (error) {
    console.error("Помилка при генерації PDF:", error)
    throw HttpError(500, "Помилка при генерації PDF")
  } finally {
    // Закриваємо сторінку
    if (page) {
      await page.close()
    }
  }
}
