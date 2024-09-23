import path from "path"
import { fileURLToPath } from "url"
import puppeteer from "puppeteer"
import "dotenv/config"
import HttpError from "./HttpError.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const localStyles = path.resolve(__dirname, "../local_styles/styles.css")
const ENVIRONMENT = process.env.ENVIRONMENT || "PRODUCTION"

export const generateBufferPDF = async ({ html, styles }) => {
  const htmlContent = decodeURIComponent(html)
  let browser

  try {
    if (ENVIRONMENT === "DEVELOPMENT") {
      browser = await puppeteer.launch()
    } else if (ENVIRONMENT === "PRODUCTION") {
      browser = await puppeteer.launch({
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      })
    } else {
      browser = await puppeteer.launch()
    }

    const page = await browser.newPage()

    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    // Встановлення стилів
    if (styles) {
      const stylesContent = decodeURIComponent(styles)
      await page.addStyleTag({ content: stylesContent })
    } else {
      await page.addStyleTag({ path: localStyles })
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
    })

    return pdfBuffer
  } catch (error) {
    console.error("Помилка при генерації PDF:", error)
    throw new HttpError(500, "Помилка при генерації PDF")
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
