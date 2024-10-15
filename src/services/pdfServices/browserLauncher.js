import puppeteer from "puppeteer";
import "dotenv/config";
import { serviceLogger } from "../../config/logConfig.js";
import { logError } from "../../config/logError.js";

const ENVIRONMENT = process.env.ENVIRONMENT || "PRODUCTION";

export const browserLauncher = async () => {
  let browser;
  try {
    switch (ENVIRONMENT) {
      case "DEVELOPMENT":
        browser = await puppeteer.launch();
        serviceLogger.info(`Browser started in DEVELOPMENT mode`);
        break;

      case "PRODUCTION":
        const executablePath = process.env.CHROMIUM_PATH || "/usr/bin/chromium";

        // Перевірка шляху до хроміума
        if (!executablePath) {
          throw new Error("Executable path for Chromium is not defined.");
        }

        browser = await puppeteer.launch({
          executablePath,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        serviceLogger.info(`Browser started in PRODUCTION mode`);
        break;

      default:
        browser = await puppeteer.launch();
        serviceLogger.warn(
          `Browser started in DEFAULT mode (environment undefined)`
        );
        break;
    }

    return browser;
  } catch (error) {
    logError(error, null, "Browser failed to start");

    if (browser) {
      await browser.close();
      serviceLogger.info("Browser instance closed by error");
    }

    throw error;
  }
};
