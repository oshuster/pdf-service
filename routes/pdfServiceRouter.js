import express from "express";

import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import { logRequest } from "../config/logConfig.js";
import { pdfController } from "../controllers/pdfController.js";
import validateBody from "../helpers/validatorBody.js";
import { pdfRequestSchema } from "../schemas/pdfRequestSchema.js";
import validateHtmlSyntax from "../helpers/validatorHtmlSyntax.js";

const pdfServiceRouter = express.Router();

pdfServiceRouter.use(logRequest);

pdfServiceRouter.post(
  "/make",
  validateBody(pdfRequestSchema),
  validateHtmlSyntax,
  ctrlWrapper(pdfController)
);

export default pdfServiceRouter;
