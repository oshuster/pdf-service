import { Page } from 'playwright';
import * as grpc from '@grpc/grpc-js';
import { getPage, releasePage } from '@oshuster/pdf-generator';
import { serviceLogger } from '../config/logConfig';
import { PdfRequest, PdfResponse, ForAllPdfRequest } from '../generated/pdf';

export const withPage = async <T extends PdfRequest | ForAllPdfRequest>(
  call: grpc.ServerUnaryCall<T, PdfResponse>,
  callback: grpc.sendUnaryData<PdfResponse>,
  handler: (
    call: grpc.ServerUnaryCall<T & { page: Page }, PdfResponse>,
    callback: grpc.sendUnaryData<PdfResponse>
  ) => Promise<void>
): Promise<void> => {
  let page: Page | undefined;
  try {
    page = await getPage();
    if (!page) {
      throw new Error('Error on getting page');
    }
    (call.request as T & { page: Page }).page = page;
    await handler(
      call as grpc.ServerUnaryCall<T & { page: Page }, PdfResponse>,
      callback
    );
  } catch (error) {
    serviceLogger.error(`Error handling request with page ${error}`);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Error handling request',
    } as grpc.ServiceError);
  } finally {
    if (page) releasePage(page);
  }
};
