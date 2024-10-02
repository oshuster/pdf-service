import express from "express";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import { logRequest } from "../config/logConfig.js";
import { pdfController } from "../controllers/pdfController.js";
import { pdfRequestSchema } from "../schemas/pdfRequestSchema.js";
import { validatorBody } from "../middlewares/validatorBody.js";
import { validatorHtmlSyntax } from "../middlewares/validatorHtmlSyntax.js";
import { addUuidMiddleware } from "../middlewares/addUuidMiddleware.js";
import { zipController } from "../controllers/zipController.js";

const pdfServiceRouter = express.Router();

pdfServiceRouter.use(logRequest);

pdfServiceRouter.post(
  "/make-zip",
  validatorBody(pdfRequestSchema),
  validatorHtmlSyntax,
  addUuidMiddleware,
  ctrlWrapper(zipController)
);

pdfServiceRouter.post(
  "/make-pdf",
  validatorBody(pdfRequestSchema),
  validatorHtmlSyntax,
  addUuidMiddleware,
  ctrlWrapper(pdfController)
);

export default pdfServiceRouter;
