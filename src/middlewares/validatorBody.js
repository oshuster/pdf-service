export const validatorBody = (schema) => {
  return async (req, _, next) => {
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.body = value;
      next();
    } catch (error) {
      error.status = 400;
      next(error);
    }
  };
};
