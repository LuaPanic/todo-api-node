// Entry point of the Express application
import { apiReference } from "@scalar/express-api-reference"
import dotenv from "dotenv"
import express from "express"
import pino from "pino"
import pinoHttp from "pino-http"
import todoRouter from "./routes/todo.js"
import { swaggerSpec } from "./swagger.js"

// Load environment variables from .env file
dotenv.config({ quiet: true })

// Structured logger — JSON in production, pretty-print in development
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" }
      : undefined,
})

const app = express()
// Parse incoming JSON request bodies
app.use(express.json())

// HTTP request logging middleware (skipped in test to keep output clean)
if (process.env.NODE_ENV !== "test") {
  app.use(pinoHttp({ logger }))
}

// Root endpoint - welcome message
app.get("/", (_req, res) => {
  logger.info("someone hit the root endpoint")
  res.json({ message: "Welcome to the Enhanced Express Todo App!" })
})

// Debug endpoint only available in development mode
if (process.env.NODE_ENV === "development") {
  app.get("/debug", (_req, res) => {
    res.json({
      secret: process.env.SECRET_KEY,
      apiKey: process.env.API_KEY,
      env: process.env.NODE_ENV,
    })
  })
}

// Health check endpoint used by CI and monitoring
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() })
})

// API docs available at /api-docs
app.use("/api-docs", apiReference({ spec: { content: swaggerSpec } }))

// Mount the todos router under /todos
app.use("/todos", todoRouter)

const PORT = process.env.PORT || 3000

// Do not start the server when running tests
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    logger.info({ port: PORT }, `Server running on http://localhost:${PORT}`),
  )
}

export default app
