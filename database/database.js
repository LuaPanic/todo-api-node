import initSqlJs from "sql.js"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, "..", "todo.db")

let db = null

export async function getDb() {
  if (db) {
    return db
  }

  console.log("initializing database connection")
  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

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

export function saveDb() {
  if (db) {
    console.log("saving database to disk")
    const data = db.export()
    fs.writeFileSync(DB_PATH, Buffer.from(data))
  }
}
