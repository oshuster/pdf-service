import Joi from "joi";

export const pdfRequestSchema = Joi.object({
  docName: Joi.array().items(Joi.string()).min(1).required(),
  landscape: Joi.boolean(),
  zip: Joi.boolean(),
  html: Joi.string().required(),
});
