import express from "express"

import { ctrlWrapper } from "../helpers/ctrlWrapper.js"
import { logRequest } from "../config/logConfig.js"
import { makePdf } from "../controllers/pdfController.js"
import validateBody from "../helpers/validateBody.js"
import { pdfRequestSchema } from "../schemas/pdfRequestSchema.js"
import validateHtmlSyntax from "../helpers/validateHtml.js"

const pdfServiceRouter = express.Router()

pdfServiceRouter.use(logRequest)

pdfServiceRouter.post(
  "/make",
  validateBody(pdfRequestSchema),
  validateHtmlSyntax,
  ctrlWrapper(makePdf)
)

export default pdfServiceRouter
