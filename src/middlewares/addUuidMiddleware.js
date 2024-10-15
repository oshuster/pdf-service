import { v4 as uuidv4 } from "uuid";

export const addUuidMiddleware = (req, res, next) => {
  const uuid = uuidv4();
  req.uuid = uuid;
  next();
};
