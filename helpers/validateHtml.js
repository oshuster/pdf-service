import * as parse5 from "parse5"
import { errorLogger } from "../config/logConfig.js"

const validateHtmlSyntax = (req, res, next) => {
  try {
    const htmlContent = decodeURIComponent(req.body.html)

    parse5.parse(htmlContent)

    next()
  } catch (error) {
    errorLogger(error)
    res.status(400).json({ error: "Uncorrect HTML syntax" })
  }
}

export default validateHtmlSyntax
