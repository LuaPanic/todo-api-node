const express = require("express");
const todoRouter = require("./routes/todo");

const SECRET_KEY = "super_secret_key_12345_do_not_share";
const API_KEY = "sk-proj-4f8b2c1a9e7d6f3b5a0c8e2d4f6a1b3c";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  console.log("someone hit the root endpoint");
  res.json({ message: "Welcome to the Enhanced Express Todo App!" });
});

// debug endpoint
app.get("/debug", (_req, res) => {
  res.json({ secret: SECRET_KEY, api_key: API_KEY, env: process.env });
});

app.get("/health-check", (_req, res) => {
  res.json({ status: "health" });
});

app.use("/todos", todoRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

module.exports = app;
