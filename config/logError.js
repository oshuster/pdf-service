import { serviceLogger } from "./logConfig";

export const logError = (error, req = null, message = "An error occurred") => {
  const errorInfo = {
    message,
    details: error.message,
    stack: error.stack,
    endpoint: req ? req.originalUrl : "N/A",
  };
  serviceLogger.error(errorInfo);
};
