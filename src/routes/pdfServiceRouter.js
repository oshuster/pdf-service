import express from "express";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import { pdfRequestSchema } from "../schemas/pdfRequestSchema.js";
import { validatorBody } from "../middlewares/validatorBody.js";
import { validatorHtmlSyntax } from "../middlewares/validatorHtmlSyntax.js";
import { addUuidMiddleware } from "../middlewares/addUuidMiddleware.js";
import { pdfDocumentController } from "../controllers/pdfDocumentsController.js";
import { pdfController } from "../controllers/pdfController.js";

const pdfServiceRouter = express.Router();

/**
 * @swagger
 * /make-pdf:
 *   post:
 *     summary: Генерація PDF документів
 *     description: Генерує PDF документ на основі даних, переданих у запиті.
 *     tags: [PDF Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PdfRequest'
 *     responses:
 *       200:
 *         description: Успішна генерація PDF.
 *       400:
 *         description: Помилка валідації даних.
 *       500:
 *         description: Внутрішня помилка сервера.
 */
pdfServiceRouter.post(
  "/make-pdf",
  validatorBody(pdfRequestSchema),
  validatorHtmlSyntax,
  addUuidMiddleware,
  ctrlWrapper(pdfController)
);

/**
 * @swagger
 * /doc-pdf:
 *   post:
 *     summary: Генерація PDF для ЗВІТІВ
 *     description: Генерує PDF для документів на основі переданих даних.
 *     tags: [PDF Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PdfRequest'
 *     responses:
 *       200:
 *         description: Успішна генерація PDF для документу.
 *       400:
 *         description: Помилка валідації даних.
 *       500:
 *         description: Внутрішня помилка сервера.
 */
pdfServiceRouter.post(
  "/doc-pdf",
  validatorBody(pdfRequestSchema),
  validatorHtmlSyntax,
  addUuidMiddleware,
  ctrlWrapper(pdfDocumentController)
);

export default pdfServiceRouter;
