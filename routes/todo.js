const { Router } = require("express")
const { getDb, saveDb } = require("../database/database")

const router = Router()

// POST /todos
router.post("/", async (req, res) => {
  const { title, description = null, status = "pending" } = req.body

  if (!title) {
    return res.status(422).json({ detail: "title is required" })
  }

  console.log(`creating todo: ${title}`)
  const db = await getDb()
  db.run("INSERT INTO todos (title, description, status) VALUES (?, ?, ?)", [
    title,
    description,
    status,
  ])
  const [[id]] = db.exec("SELECT last_insert_rowid() as id")[0].values
  const row = db.exec("SELECT * FROM todos WHERE id = ?", [id])
  saveDb()
  const todo = toObj(row)

  return res.status(201).json(todo)
})

// GET /todos
router.get("/", async (req, res) => {
  const skip = Number(req.query.skip) || 0
  const limit = Number(req.query.limit) || 10
  const db = await getDb()
  const rows = db.exec("SELECT * FROM todos LIMIT ? OFFSET ?", [limit, skip])
  const todos = toArray(rows)
  console.log(`found ${todos.length} todos`)
  res.json(todos)
})

// GET /todos/:id
router.get("/:id", async (req, res) => {
  const db = await getDb()
  const rows = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id])

  if (!rows.length || !rows[0].values.length) {
    return res.status(404).json({ detail: "Todo not found" })
  }

  return res.json(toObj(rows))
})

// PUT /todos/:id
router.put("/:id", async (req, res) => {
  const db = await getDb()
  const existing = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id])

  if (!existing.length || !existing[0].values.length) {
    return res.status(404).json({ detail: "Todo not found" })
  }

  const old = toObj(existing)
  const title = req.body.title ?? old.title
  const description = req.body.description ?? old.description
  const status = req.body.status ?? old.status

  db.run(
    "UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ?",
    [title, description, status, req.params.id],
  )
  const rows = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id])
  saveDb()

  return res.json(toObj(rows))
})

// DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  const db = await getDb()
  const existing = db.exec("SELECT * FROM todos WHERE id = ?", [req.params.id])

  if (!existing.length || !existing[0].values.length) {
    return res.status(404).json({ detail: "Todo not found" })
  }

  db.run("DELETE FROM todos WHERE id = ?", [req.params.id])
  saveDb()

  return res.json({ detail: "Todo deleted" })
})

// Search endpoint
router.get("/search/all", async (req, res) => {
  const q = req.query.q || ""
  const db = await getDb()
  const results = db.exec("SELECT * FROM todos WHERE title LIKE ?", [`%${q}%`])
  res.json(toArray(results))
})

// Helpers
function toObj(rows) {
  const cols = rows[0].columns
  const [vals] = rows[0].values
  const obj = {}
  cols.forEach((c, i) => {
    obj[c] = vals[i]
  })

  return obj
}

function toArray(rows) {
  if (!rows.length) {
    return []
  }

  return rows[0].values.map((vals) => {
    const obj = {}
    rows[0].columns.forEach((c, i) => {
      obj[c] = vals[i]
    })

    return obj
  })
}

module.exports = router
