import express from "express"
import morgan from "morgan"
import cors from "cors"
import "dotenv/config"
import { serviceLogger } from "./config/logConfig.js"
import pdfServiceRouter from "./routes/pdfServiceRouter.js"

const HTTP_PORT = process.env.PORT || 3344

const app = express()

app.use(morgan("tiny"))
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
  })
)
app.use(express.json())

app.use("/api/pdf-service", pdfServiceRouter)

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" })
})

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err
  res.status(status).json({ message })
})

app.listen(HTTP_PORT, () => {
  serviceLogger.info(
    `HTTP Server is running. Use our API on port: ${HTTP_PORT}`
  )
  console.log(`HTTP Server is running. Use our API on port: ${HTTP_PORT}`)
})
