import { Browser, chromium, Page } from 'playwright';
import { serviceLogger } from '../../config/logConfig';

let browserInstance: Browser | null = null;
const pagePool: Page[] = [];
const MAX_PAGES = Number(process.env.MAX_PAGES) || 5;

/**
 * Створює або повертає існуючий екземпляр браузера.
 */
export const browserLauncher = async (): Promise<Browser> => {
  if (!browserInstance) {
    try {
      serviceLogger.info('Launching Playwright Browser...');
      browserInstance = await chromium.launch({ headless: true });

      // Створюємо початковий пул сторінок
      for (let i = 0; i < MAX_PAGES; i++) {
        const page = await browserInstance.newPage();
        pagePool.push(page);
      }

      serviceLogger.info(
        `Browser is running. Available pages: ${pagePool.length}`
      );
    } catch (error) {
      serviceLogger.error(`Browser launch error: ${(error as Error).message}`);
      throw error;
    }
  }
  return browserInstance;
};

/**
 * Отримує вільну сторінку з пулу або створює нову.
 */
export const getPage = async () => {
  if (pagePool.length > 0) {
    return pagePool.pop();
  }
  if (!browserInstance) {
    throw new Error(
      'Browser instance is not available. Call browserLauncher() first.'
    );
  }

  return await browserInstance.newPage();
};

/**
 * Повертає сторінку назад у пул або закриває її.
 */
export const releasePage = (page: Page) => {
  if (pagePool.length < MAX_PAGES) {
    pagePool.push(page);
  } else {
    page.close();
  }
};

/**
 * Закриває браузер при завершенні сервера.
 */
export const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    serviceLogger.info('The browser is closed.');
  }
};
