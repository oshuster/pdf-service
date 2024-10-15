import { errorLogger } from "../config/logConfig.js"

const messageList = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict"
}

const HttpError = (status, message = messageList[status]) => {
  const error = new Error(message)
  error.status = status
  errorLogger.error(error)
  return error
}

export default HttpError
