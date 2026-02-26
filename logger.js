import pino from "pino"
import pretty from "pino-pretty"

const isDev =
  process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test"

const stream = isDev ? pretty({ colorize: true }) : undefined

const logger = pino(
  {
    level:
      process.env.NODE_ENV === "test"
        ? "silent"
        : process.env.LOG_LEVEL || "info",
  },
  stream,
)

export default logger
