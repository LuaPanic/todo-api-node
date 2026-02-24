import { beforeEach, describe, expect, it, vi } from "vitest"

// Use vi.hoisted so mock functions are stable across vi.resetModules() calls
const mockExistsSync = vi.hoisted(() => vi.fn())
const mockReadFileSync = vi.hoisted(() => vi.fn())
const mockWriteFileSync = vi.hoisted(() => vi.fn())

vi.mock("node:fs", () => ({
  default: {
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
    writeFileSync: mockWriteFileSync,
  },
}))

describe("getDb()", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })

  it("creates a new in-memory database when no file exists", async () => {
    mockExistsSync.mockReturnValue(false)
    const { getDb } = await import("../database/database.js")
    const db = await getDb()

    expect(db).toBeDefined()
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='todos'",
    )
    expect(tables[0].values[0][0]).toBe("todos")
  })

  it("returns the same cached instance on subsequent calls", async () => {
    mockExistsSync.mockReturnValue(false)
    const { getDb } = await import("../database/database.js")
    const db1 = await getDb()
    const db2 = await getDb()

    expect(db1).toBe(db2)
  })

  it("loads an existing database file from disk", async () => {
    const initSqlJs = (await import("sql.js")).default
    const SQL = await initSqlJs()
    const tempDb = new SQL.Database()
    tempDb.run(
      `CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending'
      )`,
    )
    const exported = tempDb.export()
    tempDb.close()

    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(Buffer.from(exported))

    const { getDb } = await import("../database/database.js")
    const db = await getDb()

    expect(db).toBeDefined()
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='todos'",
    )
    expect(tables[0].values[0][0]).toBe("todos")
  })
})

describe("saveDb()", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })

  it("writes database to disk when initialized", async () => {
    mockExistsSync.mockReturnValue(false)
    mockWriteFileSync.mockImplementation(() => {
      /* Empty */
    })
    const { getDb, saveDb } = await import("../database/database.js")
    await getDb()
    saveDb()

    expect(mockWriteFileSync).toHaveBeenCalledOnce()
  })

  it("does nothing when database is not initialized", async () => {
    const { saveDb } = await import("../database/database.js")
    saveDb()

    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })
})
