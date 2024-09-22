import express from "express"

import { ctrlWrapper } from "../helpers/ctrlWrapper.js"
import { logRequest } from "../config/logConfig.js"

const pdfServiceRouter = express.Router()

pdfServiceRouter.use(logRequest)

// pdfServiceRouter.get("/make", ctrlWrapper())

export default pdfServiceRouter
