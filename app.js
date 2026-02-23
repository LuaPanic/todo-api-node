import dotenv from "dotenv"
import express from "express"
import todoRouter from "./routes/todo.js"

dotenv.config({ quiet: true })

const app = express()
app.use(express.json())

app.get("/", (_req, res) => {
  console.log("someone hit the root endpoint")
  res.json({ message: "Welcome to the Enhanced Express Todo App!" })
})

if (process.env.NODE_ENV === "development") {
  app.get("/debug", (_req, res) => {
    res.json({
      secret: process.env.SECRET_KEY,
      apiKey: process.env.API_KEY,
      env: process.env.NODE_ENV,
    })
  })
}

app.get("/health-check", (_req, res) => {
  res.json({ status: "health" })
})

app.use("/todos", todoRouter)

const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  )
}

export default app
