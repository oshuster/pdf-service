import { Page } from 'playwright';

declare global {
  namespace Express {
    interface Request {
      page?: Page;
    }
  }
}
