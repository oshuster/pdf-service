import express from 'express';
import { ctrlWrapper } from '../helpers/ctrlWrapper.js';
import {
  forAllPdfRequestSchema,
  pdfRequestSchema,
} from '../schemas/pdfRequestSchema.js';
import { validatorBody } from '../middlewares/validatorBody.js';
import { validatorHtmlSyntax } from '../middlewares/validatorHtmlSyntax.js';
import { addUuidMiddleware } from '../middlewares/addUuidMiddleware.js';
import { pdfDocumentController } from '../controllers/pdfDocumentsController.js';
import { pdfController } from '../controllers/pdfController.js';
import multer from 'multer';
import { uploadStylesController } from '../controllers/uploadStylesController.js';

const pdfServiceRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

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
  '/make-pdf',
  validatorBody(forAllPdfRequestSchema),
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
 *             $ref: '#/components/schemas/docPdfRequest'
 *     responses:
 *       200:
 *         description: Успішна генерація PDF для документу.
 *       400:
 *         description: Помилка валідації даних.
 *       500:
 *         description: Внутрішня помилка сервера.
 */
pdfServiceRouter.post(
  '/doc-pdf',
  validatorBody(pdfRequestSchema),
  validatorHtmlSyntax,
  addUuidMiddleware,
  ctrlWrapper(pdfDocumentController)
);

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Завантаження файлу стилів
 *     description: Дозволяє завантажити CSS-файл, визначає його категорію та зберігає у відповідній папці.
 *     tags: [Styles Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSS-файл для завантаження
 *     responses:
 *       200:
 *         description: Файл успішно завантажено.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Файл успішно завантажено"
 *                 path:
 *                   type: string
 *                   example: "/path/to/file.css"
 *       400:
 *         description: Неправильний формат файлу або файл не надано.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Файл не було надано"
 *       500:
 *         description: Внутрішня помилка сервера.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Виникла внутрішня помилка"
 */
pdfServiceRouter.post('/upload', upload.single('file'), uploadStylesController);

export default pdfServiceRouter;
