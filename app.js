import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import { serviceLogger } from "./config/logConfig.js";
import pdfServiceRouter from "./routes/pdfServiceRouter.js";
import { browserLauncher } from "./services/pdfServices/browserLauncher.js";

const HTTP_PORT = process.env.PORT || 3344;
const app = express();

let browser;

const startServer = async () => {
  try {
    browser = await browserLauncher();

    app.use(morgan("tiny"));
    app.use(
      cors({
        origin: "*",
        methods: "GET,POST,PUT,DELETE",
        allowedHeaders: "Content-Type,Authorization",
      })
    );
    // app.use(express.json());
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ limit: "10mb", extended: true }));

    app.use(
      "/api/pdf-service",
      (req, res, next) => {
        req.browser = browser;
        next();
      },
      pdfServiceRouter
    );

    app.use((_, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    app.use((err, req, res, next) => {
      const { status = 500, message = "Server error" } = err;
      res.status(status).json({ message });
    });

    app.listen(HTTP_PORT, () => {
      serviceLogger.info(
        `HTTP Server is running. Use our API on port: ${HTTP_PORT}`
      );
      console.log(`HTTP Server is running. Use our API on port: ${HTTP_PORT}`);
    });
  } catch (error) {
    serviceLogger.error("Failed to start the server", error);
    console.error("Failed to start the server", error);
  }
};

startServer();
