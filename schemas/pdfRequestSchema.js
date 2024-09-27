import Joi from "joi";

export const pdfRequestSchema = Joi.object({
  docName: Joi.string().required(),
  html: Joi.string().required(),
  styles: Joi.string().allow("").optional(),
});
