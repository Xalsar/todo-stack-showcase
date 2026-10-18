import { Prisma } from "@prisma/client"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

const getSessionMock = vi.hoisted(() => vi.fn())

vi.mock("../lib/auth.js", () => ({
  auth: { api: { getSession: getSessionMock }, handler: vi.fn() },
}))

const prismaMock = vi.hoisted(() => ({
  todo: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  label: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
}))

vi.mock("../lib/prisma.js", () => ({ prisma: prismaMock }))

import { app } from "../app.js"

const USER_ID = "user-1"
const TODO_ID = "11111111-1111-4111-8111-111111111111"
const LABEL_ID = "22222222-2222-4222-8222-222222222222"

type TodoRow = {
  id: string
  title: string
  done: boolean
  labelId: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

const baseTodo: TodoRow = {
  id: TODO_ID,
  title: "Write tests",
  done: false,
  labelId: null,
  userId: USER_ID,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-02T00:00:00.000Z"),
}

function makeTodo(overrides: Partial<TodoRow> = {}): TodoRow {
  return { ...baseTodo, ...overrides }
}

function notFoundError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Record not found", {
    code: "P2025",
    clientVersion: "6.0.0",
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  getSessionMock.mockResolvedValue({ user: { id: USER_ID } })
})

describe("GET /todos", () => {
  it("returns the authenticated user's todos", async () => {
    prismaMock.todo.findMany.mockResolvedValue([makeTodo()])

    const res = await request(app).get("/todos")

    expect(res.status).toBe(200)
    expect(prismaMock.todo.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      orderBy: { createdAt: "desc" },
    })
    expect(res.body).toEqual([
      {
        id: TODO_ID,
        title: "Write tests",
        done: false,
        labelId: null,
        userId: USER_ID,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
    ])
  })

  it("scopes results to the session user", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user-2" } })
    prismaMock.todo.findMany.mockResolvedValue([])

    await request(app).get("/todos").expect(200)

    expect(prismaMock.todo.findMany).toHaveBeenCalledWith({
      where: { userId: "user-2" },
      orderBy: { createdAt: "desc" },
    })
  })

  it("rejects unauthenticated requests", async () => {
    getSessionMock.mockResolvedValue(null)

    const res = await request(app).get("/todos")

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Unauthorized" })
    expect(prismaMock.todo.findMany).not.toHaveBeenCalled()
  })
})

describe("POST /todos", () => {
  it("creates a todo for the authenticated user", async () => {
    prismaMock.todo.create.mockResolvedValue(makeTodo({ title: "Buy milk" }))

    const res = await request(app).post("/todos").send({ title: "Buy milk" })

    expect(res.status).toBe(201)
    expect(prismaMock.todo.create).toHaveBeenCalledWith({
      data: { title: "Buy milk", userId: USER_ID },
    })
    expect(res.body.title).toBe("Buy milk")
  })

  it("rejects an empty title with 400", async () => {
    const res = await request(app).post("/todos").send({ title: "" })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
    expect(prismaMock.todo.create).not.toHaveBeenCalled()
  })

  it("rejects a missing body with 400", async () => {
    const res = await request(app).post("/todos").send({})

    expect(res.status).toBe(400)
    expect(prismaMock.todo.create).not.toHaveBeenCalled()
  })
})

describe("PATCH /todos/:id/done", () => {
  it("sets the done flag", async () => {
    prismaMock.todo.update.mockResolvedValue(makeTodo({ done: true }))

    const res = await request(app)
      .patch(`/todos/${TODO_ID}/done`)
      .send({ done: true })

    expect(res.status).toBe(200)
    expect(res.body.done).toBe(true)
    expect(prismaMock.todo.update).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
      data: { done: true },
    })
  })

  it("rejects a non-boolean done with 400", async () => {
    const res = await request(app)
      .patch(`/todos/${TODO_ID}/done`)
      .send({ done: "yes" })

    expect(res.status).toBe(400)
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("rejects a non-uuid id with 400", async () => {
    const res = await request(app)
      .patch("/todos/not-a-uuid/done")
      .send({ done: true })

    expect(res.status).toBe(400)
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("returns 404 for a missing todo", async () => {
    prismaMock.todo.update.mockRejectedValue(notFoundError())

    const res = await request(app)
      .patch(`/todos/${TODO_ID}/done`)
      .send({ done: true })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Todo not found" })
  })
})

describe("PATCH /todos/:id/title", () => {
  it("updates the title", async () => {
    prismaMock.todo.update.mockResolvedValue(makeTodo({ title: "Renamed" }))

    const res = await request(app)
      .patch(`/todos/${TODO_ID}/title`)
      .send({ title: "Renamed" })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Renamed")
    expect(prismaMock.todo.update).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
      data: { title: "Renamed" },
    })
  })

  it("rejects an empty title with 400", async () => {
    const res = await request(app)
      .patch(`/todos/${TODO_ID}/title`)
      .send({ title: "" })

    expect(res.status).toBe(400)
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("rejects a non-uuid id with 400", async () => {
    const res = await request(app)
      .patch("/todos/not-a-uuid/title")
      .send({ title: "Renamed" })

    expect(res.status).toBe(400)
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("returns 404 for a missing todo", async () => {
    prismaMock.todo.update.mockRejectedValue(notFoundError())

    const res = await request(app)
      .patch(`/todos/${TODO_ID}/title`)
      .send({ title: "Renamed" })

    expect(res.status).toBe(404)
  })
})

describe("PATCH /todos/:id/label", () => {
  it("assigns an existing label", async () => {
    prismaMock.label.findFirst.mockResolvedValue({ id: LABEL_ID })
    prismaMock.todo.update.mockResolvedValue(makeTodo({ labelId: LABEL_ID }))

    const res = await request(app)
      .patch(`/todos/${TODO_ID}/label`)
      .send({ labelId: LABEL_ID })

    expect(res.status).toBe(200)
    expect(res.body.labelId).toBe(LABEL_ID)
  })

  it("clears the label with null", async () => {
    prismaMock.todo.update.mockResolvedValue(makeTodo({ labelId: null }))

    const res = await request(app)
      .patch(`/todos/${TODO_ID}/label`)
      .send({ labelId: null })

    expect(res.status).toBe(200)
    expect(prismaMock.label.findFirst).not.toHaveBeenCalled()
  })

  it("returns 400 when the label does not exist", async () => {
    prismaMock.label.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .patch(`/todos/${TODO_ID}/label`)
      .send({ labelId: LABEL_ID })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Label not found" })
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("returns 404 when the todo does not exist", async () => {
    prismaMock.label.findFirst.mockResolvedValue({ id: LABEL_ID })
    prismaMock.todo.update.mockRejectedValue(notFoundError())

    const res = await request(app)
      .patch(`/todos/${TODO_ID}/label`)
      .send({ labelId: LABEL_ID })

    expect(res.status).toBe(404)
  })

  it("rejects a non-uuid labelId with 400", async () => {
    const res = await request(app)
      .patch(`/todos/${TODO_ID}/label`)
      .send({ labelId: "nope" })

    expect(res.status).toBe(400)
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("rejects a non-uuid id with 400", async () => {
    const res = await request(app)
      .patch("/todos/not-a-uuid/label")
      .send({ labelId: LABEL_ID })

    expect(res.status).toBe(400)
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })
})

describe("POST /todos/:id/label", () => {
  const labelRow = {
    id: LABEL_ID,
    name: "Errands",
    createdAt: new Date("2024-01-03T00:00:00.000Z"),
    updatedAt: new Date("2024-01-03T00:00:00.000Z"),
    userId: USER_ID,
  }

  it("creates a label, applies it, and returns the todo and label", async () => {
    prismaMock.todo.update.mockResolvedValue({
      ...makeTodo({ labelId: LABEL_ID }),
      label: labelRow,
    })

    const res = await request(app)
      .post(`/todos/${TODO_ID}/label`)
      .send({ name: "Errands" })

    expect(res.status).toBe(201)
    expect(res.body.todo).toMatchObject({ id: TODO_ID, labelId: LABEL_ID })
    expect(res.body.label).toEqual({
      id: LABEL_ID,
      name: "Errands",
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
    })
  })

  it("rejects an empty name with 400", async () => {
    const res = await request(app)
      .post(`/todos/${TODO_ID}/label`)
      .send({ name: "" })

    expect(res.status).toBe(400)
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("rejects a non-uuid id with 400", async () => {
    const res = await request(app)
      .post("/todos/not-a-uuid/label")
      .send({ name: "Errands" })

    expect(res.status).toBe(400)
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("returns 404 when the todo does not exist", async () => {
    prismaMock.todo.update.mockRejectedValue(notFoundError())

    const res = await request(app)
      .post(`/todos/${TODO_ID}/label`)
      .send({ name: "Errands" })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Todo not found" })
  })

  it("returns 409 when the name already exists", async () => {
    prismaMock.todo.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.0.0",
      })
    )

    const res = await request(app)
      .post(`/todos/${TODO_ID}/label`)
      .send({ name: "Work" })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      error: "A label with this name already exists",
    })
  })
})

describe("DELETE /todos/:id", () => {
  it("deletes the todo", async () => {
    prismaMock.todo.delete.mockResolvedValue(makeTodo())

    const res = await request(app).delete(`/todos/${TODO_ID}`)

    expect(res.status).toBe(200)
    expect(prismaMock.todo.delete).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
    })
  })

  it("returns 404 for a missing todo", async () => {
    prismaMock.todo.delete.mockRejectedValue(notFoundError())

    const res = await request(app).delete(`/todos/${TODO_ID}`)

    expect(res.status).toBe(404)
  })

  it("rejects a non-uuid id with 400", async () => {
    const res = await request(app).delete("/todos/not-a-uuid")

    expect(res.status).toBe(400)
    expect(prismaMock.todo.delete).not.toHaveBeenCalled()
  })
})
