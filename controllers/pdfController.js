import { errorLogger, logResponse } from "../config/logConfig.js"
import { generateBufferPDF } from "../helpers/generateBufferPDF.js"

export const makePdf = async (req, res) => {
  try {
    const pdfBuffer = await generateBufferPDF(req.body)

    // Сетаємо хідера
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${
        req.body.docName || "document"
      }.pdf"`,
      "Content-Length": pdfBuffer.length
    })
    // Відправка буферу без обробки (обробка ламала пдф)
    logResponse(`PDF file created ${req.body.docName || "document"}.pdf`)
    res.end(pdfBuffer)
  } catch (error) {
    console.error("Error generation pdf file:", error.message)
    errorLogger.error(`Error generation pdf file: ${error.message}`)
    res
      .status(error.response ? error.response.status : 500)
      .json({ error: "Error generation pdf file" })
  }
}
