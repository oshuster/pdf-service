import * as parse5 from "parse5";
import { serviceLogger } from "../config/logConfig.js";

export const validatorHtmlSyntax = (req, res, next) => {
  try {
    const htmlContent = decodeURIComponent(req.body.html);

    parse5.parse(htmlContent);

    next();
  } catch (error) {
    serviceLogger.error(error);
    res.status(400).json({ error: "Uncorrect HTML syntax" });
  }
};
