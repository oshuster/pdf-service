import Joi from "joi";

export const pdfRequestSchema = Joi.object({
  docName: Joi.array().items(Joi.string()).min(1).required(),
  html: Joi.string().required(),
});
