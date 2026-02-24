// Entry point of the Express application
import dotenv from "dotenv"
import express from "express"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./swagger.js"
import todoRouter from "./routes/todo.js"

// Load environment variables from .env file
dotenv.config({ quiet: true })

const app = express()
// Parse incoming JSON request bodies
app.use(express.json())

// Root endpoint - welcome message
app.get("/", (_req, res) => {
  console.log("someone hit the root endpoint")
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
app.get("/health-check", (_req, res) => {
  res.json({ status: "health" })
})

// Swagger UI available at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Mount the todo router under /todos
app.use("/todos", todoRouter)

const PORT = process.env.PORT || 3000

// Do not start the server when running tests
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  )
}

export default app
