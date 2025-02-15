import { chromium } from 'playwright';
import { serviceLogger } from '../../config/logConfig.js';

let browserInstance = null;
const pagePool = [];
const MAX_PAGES = Number(process.env.MAX_PAGES) || 5;

/**
 * @typedef {import("playwright").Browser} Browser
 * @typedef {import("playwright").Page} Page
 */

/**
 * Створює або повертає існуючий екземпляр браузера.
 * @returns {Promise<Browser>}
 */
export const browserLauncher = async () => {
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
      serviceLogger.error(`Browser launch error: ${error.message}`);
      throw error;
    }
  }
  return browserInstance;
};

/**
 * Отримує вільну сторінку з пулу або створює нову.
 * @returns {Promise<Page>}
 */
export const getPage = async () => {
  if (pagePool.length > 0) {
    return pagePool.pop();
  }
  return await browserInstance.newPage();
};

/**
 * Повертає сторінку назад у пул або закриває її.
 * @param {Page} page
 */
export const releasePage = (page) => {
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
