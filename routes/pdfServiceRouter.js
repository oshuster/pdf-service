import express from "express"

import { ctrlWrapper } from "../helpers/ctrlWrapper.js"
import { logRequest } from "../config/logConfig.js"
import { makePdf } from "../controllers/pdfController.js"

const pdfServiceRouter = express.Router()

pdfServiceRouter.use(logRequest)

// TODO: add midlleware for validation body

pdfServiceRouter.post("/make", ctrlWrapper(makePdf))

export default pdfServiceRouter
