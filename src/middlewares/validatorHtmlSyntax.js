import * as parse5 from "parse5";
import { logError } from "../config/logError.js";

export const validatorHtmlSyntax = (req, res, next) => {
  try {
    const htmlContent = decodeURIComponent(req.body.html);

    parse5.parse(htmlContent);

    next();
  } catch (error) {
    logError(error, null, "Uncorrect HTML syntax");
    res.status(400).json({ error: "Uncorrect HTML syntax" });
  }
};
