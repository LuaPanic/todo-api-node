import request from "supertest"
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

vi.mock("../database/database.js")

import initSqlJs from "sql.js"
import app from "../app.js"
import { getDb } from "../database/database.js"

let testDb = null

beforeAll(async () => {
  const SQL = await initSqlJs()

  testDb = new SQL.Database()
  testDb.run(
    `CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending'
    )`,
  )
  getDb.mockResolvedValue(testDb)
})

beforeEach(() => {
  testDb.run("DELETE FROM todos")
})

afterAll(() => {
  testDb.close()
})

describe("GET /", () => {
  it("returns welcome message", async () => {
    const res = await request(app).get("/")

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Welcome to the Enhanced Express Todo App!")
  })
})

describe("GET /health", () => {
  it("returns health status", async () => {
    const res = await request(app).get("/health")

    expect(res.status).toBe(200)
    expect(res.body.status).toBe("ok")
  })
})

describe("POST /todos", () => {
  it("creates a todo with title only", async () => {
    const res = await request(app).post("/todos").send({ title: "Test todo" })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe("Test todo")
    expect(res.body.status).toBe("pending")
    expect(res.body.description).toBeNull()
    expect(res.body.id).toBeDefined()
  })

  it("creates a todo with all fields", async () => {
    const res = await request(app).post("/todos").send({
      title: "Full todo",
      description: "A description",
      status: "done",
    })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe("Full todo")
    expect(res.body.description).toBe("A description")
    expect(res.body.status).toBe("done")
  })

  it("returns 422 when title is missing", async () => {
    const res = await request(app)
      .post("/todos")
      .send({ description: "No title" })

    expect(res.status).toBe(422)
    expect(res.body.detail).toBe("title is required")
  })
})

describe("GET /todos", () => {
  beforeEach(async () => {
    await request(app).post("/todos").send({ title: "First" })
    await request(app).post("/todos").send({ title: "Second" })
    await request(app).post("/todos").send({ title: "Third" })
  })

  it("returns all todos", async () => {
    const res = await request(app).get("/todos")

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })

  it("supports pagination with limit", async () => {
    const res = await request(app).get("/todos?limit=2")

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it("supports pagination with skip", async () => {
    const res = await request(app).get("/todos?skip=2")

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe("GET /todos/:id", () => {
  it("returns a todo by id", async () => {
    const createRes = await request(app)
      .post("/todos")
      .send({ title: "Find me" })
    const { id } = createRes.body
    const res = await request(app).get(`/todos/${id}`)

    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Find me")
  })

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/todos/9999")

    expect(res.status).toBe(404)
    expect(res.body.detail).toBe("Todo not found")
  })
})

describe("PUT /todos/:id", () => {
  it("updates a todo title", async () => {
    const createRes = await request(app)
      .post("/todos")
      .send({ title: "Original" })
    const { id } = createRes.body
    const res = await request(app)
      .put(`/todos/${id}`)
      .send({ title: "Updated" })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Updated")
  })

  it("partially updates a todo keeping other fields", async () => {
    const createRes = await request(app)
      .post("/todos")
      .send({ title: "Partial", status: "pending" })
    const { id } = createRes.body
    const res = await request(app).put(`/todos/${id}`).send({ status: "done" })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Partial")
    expect(res.body.status).toBe("done")
  })

  it("returns 404 for unknown id", async () => {
    const res = await request(app).put("/todos/9999").send({ title: "Ghost" })

    expect(res.status).toBe(404)
    expect(res.body.detail).toBe("Todo not found")
  })
})

describe("DELETE /todos/:id", () => {
  it("deletes a todo and returns confirmation", async () => {
    const createRes = await request(app)
      .post("/todos")
      .send({ title: "Delete me" })
    const { id } = createRes.body
    const deleteRes = await request(app).delete(`/todos/${id}`)

    expect(deleteRes.status).toBe(200)
    expect(deleteRes.body.detail).toBe("Todo deleted")

    const getRes = await request(app).get(`/todos/${id}`)

    expect(getRes.status).toBe(404)
  })

  it("returns 404 for unknown id", async () => {
    const res = await request(app).delete("/todos/9999")

    expect(res.status).toBe(404)
  })
})

describe("GET /todos/search/all", () => {
  beforeEach(async () => {
    await request(app).post("/todos").send({ title: "Buy milk" })
    await request(app).post("/todos").send({ title: "Buy eggs" })
    await request(app).post("/todos").send({ title: "Clean house" })
  })

  it("returns matching todos", async () => {
    const res = await request(app).get("/todos/search/all?q=Buy")

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it("returns all todos when query is empty", async () => {
    const res = await request(app).get("/todos/search/all")

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })

  it("returns empty array when no match", async () => {
    const res = await request(app).get("/todos/search/all?q=xyz")

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })
})
