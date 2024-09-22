import path from "path"
import { fileURLToPath } from "url"
import puppeteer from "puppeteer"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outputFolder = path.resolve(__dirname, "../pdf_files")

export const generateStyledPDF = async ({ docName, html, styles }) => {
  console.log(outputFolder)
  const htmlContent = decodeURIComponent(html)

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // Вказуємо абсолютний шлях до CSS файлу
  const localStyles = path.resolve(__dirname, "../local_styles/styles.css")

  // Встановлюємо вміст HTML і підключаємо стилі
  await page.setContent(htmlContent, { waitUntil: "networkidle0" })

  // Наданняя дозволу доступу до локальних ресурсів
  await page.addStyleTag({ path: localStyles })

  // Формуємо шлях до збереження файлу
  const outputFilePath = path.resolve(
    outputFolder,
    `${docName || new Date().toISOString()}.pdf`
  )

  // Генеруємо PDF
  await page.pdf({
    path: outputFilePath,
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
  })

  await browser.close()
  console.log("PDF з кастомними стилями створено!")
}
