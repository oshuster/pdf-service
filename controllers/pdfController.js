import { logResponse } from "../config/logConfig.js"
import { generatePdfService } from "../services/pdfServices/generatePdfService.js"

export const pdfController = async (req, res) => {
  const pdfBuffer = await generatePdfService(req)

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
}
