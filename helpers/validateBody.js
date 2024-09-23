import HttpError from "./HttpError.js"

const validateBody = (schema) => {
  const func = async (req, _, next) => {
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true
      })
      req.body = value
      next()
    } catch (error) {
      next(HttpError(400, error.message))
    }
  }
  return func
}

export default validateBody
