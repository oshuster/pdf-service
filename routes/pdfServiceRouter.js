import express from "express";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import { logRequest } from "../config/logConfig.js";
import { pdfController } from "../controllers/pdfController.js";
import { pdfRequestSchema } from "../schemas/pdfRequestSchema.js";
import { validatorBody } from "../middlewares/validatorBody.js";
import { validatorHtmlSyntax } from "../middlewares/validatorHtmlSyntax.js";
import { generateHtmlCssMiddleware } from "../middlewares/generateHtmlCssMiddleware.js";

const pdfServiceRouter = express.Router();

pdfServiceRouter.use(logRequest);

pdfServiceRouter.post(
  "/make",
  validatorBody(pdfRequestSchema),
  validatorHtmlSyntax,
  generateHtmlCssMiddleware,
  ctrlWrapper(pdfController)
);

export default pdfServiceRouter;
