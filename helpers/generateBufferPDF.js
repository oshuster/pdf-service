import path from "path"
import { fileURLToPath } from "url"
import puppeteer from "puppeteer"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const localStyles = path.resolve(__dirname, "../local_styles/styles.css")

export const generateBufferPDF = async ({ docName, html, styles }) => {
  const htmlContent = decodeURIComponent(html)

  // const browser = await puppeteer.launch()
  const browser = await puppeteer.launch({
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  })
  const page = await browser.newPage()

  await page.setContent(htmlContent, { waitUntil: "networkidle0" })
  await page.addStyleTag({ path: localStyles })

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
  })

  await browser.close()
  return pdfBuffer
}
