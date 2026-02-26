// SQLite database initialization and persistence using sql.js
import initSqlJs from "sql.js"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import logger from "../logger.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Path to the SQLite database file on disk
const DB_PATH = path.join(__dirname, "..", "todo.db")

// Singleton database instance
let db = null

// Returns the initialized database, loading from disk if it exists
export async function getDb() {
  if (db) {
    return db
  }

  logger.info("initializing database connection")
  const SQL = await initSqlJs()

  // Load existing database file or create a new in-memory database
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  // Create the todos table if it does not already exist
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending'
    )
  `)

  return db
}

// Persists the in-memory database to the file system
export function saveDb() {
  if (db) {
    logger.info("saving database to disk")
    const data = db.export()
    fs.writeFileSync(DB_PATH, Buffer.from(data))
  }
}
