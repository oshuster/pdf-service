import HttpError from "../helpers/HttpError.js";

export const validatorBody = (schema) => {
  const func = async (req, _, next) => {
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.body = value;
      next();
    } catch (error) {
      next(HttpError(400, error.message));
    }
  };
  return func;
};
