import { Page } from 'playwright';
import { ForAllPdfRequest, PdfRequest } from '../generated/pdf';

export interface DocPdfRequestWithPage extends PdfRequest {
  /** Додатково передається сторінка Playwright */
  page: Page;
}

export interface UniPdfRequestWithPage extends ForAllPdfRequest {
  /** Додатково передається сторінка Playwright */
  page: Page;
}
