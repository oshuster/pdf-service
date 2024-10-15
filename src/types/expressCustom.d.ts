import { Browser } from "puppeteer";

declare global {
  namespace Express {
    interface Request {
      browser?: Browser;
    }
  }
}
