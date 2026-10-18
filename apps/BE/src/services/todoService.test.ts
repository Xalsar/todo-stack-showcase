import { Prisma } from "@prisma/client"
import { beforeEach, describe, expect, it, vi } from "vitest"

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

import {
  createTodo,
  createTodoLabel,
  deleteTodo,
  listTodos,
  setTodoDone,
  updateTodoLabel,
  updateTodoTitle,
} from "./todoService.js"

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
})

describe("listTodos", () => {
  it("queries the user's todos newest first and maps them to DTOs", async () => {
    prismaMock.todo.findMany.mockResolvedValue([makeTodo()])

    const result = await listTodos(USER_ID)

    expect(prismaMock.todo.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      orderBy: { createdAt: "desc" },
    })
    expect(result).toEqual([
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

  it("returns an empty array when there are no todos", async () => {
    prismaMock.todo.findMany.mockResolvedValue([])

    await expect(listTodos(USER_ID)).resolves.toEqual([])
  })
})

describe("createTodo", () => {
  it("creates a todo scoped to the user and returns its DTO", async () => {
    prismaMock.todo.create.mockResolvedValue(makeTodo({ title: "Buy milk" }))

    const result = await createTodo({ title: "Buy milk" }, USER_ID)

    expect(prismaMock.todo.create).toHaveBeenCalledWith({
      data: { title: "Buy milk", userId: USER_ID },
    })
    expect(result.title).toBe("Buy milk")
    expect(result.userId).toBe(USER_ID)
  })
})

describe("setTodoDone", () => {
  it("updates the done flag and returns the DTO", async () => {
    prismaMock.todo.update.mockResolvedValue(makeTodo({ done: true }))

    const result = await setTodoDone(TODO_ID, true, USER_ID)

    expect(prismaMock.todo.update).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
      data: { done: true },
    })
    expect(result?.done).toBe(true)
  })

  it("returns null when the todo does not exist", async () => {
    prismaMock.todo.update.mockRejectedValue(notFoundError())

    await expect(setTodoDone(TODO_ID, true, USER_ID)).resolves.toBeNull()
  })

  it("rethrows unexpected prisma errors", async () => {
    prismaMock.todo.update.mockRejectedValue(new Error("connection lost"))

    await expect(setTodoDone(TODO_ID, true, USER_ID)).rejects.toThrow(
      "connection lost"
    )
  })
})

describe("updateTodoTitle", () => {
  it("updates the title and returns the DTO", async () => {
    prismaMock.todo.update.mockResolvedValue(makeTodo({ title: "Renamed" }))

    const result = await updateTodoTitle(TODO_ID, "Renamed", USER_ID)

    expect(prismaMock.todo.update).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
      data: { title: "Renamed" },
    })
    expect(result?.title).toBe("Renamed")
  })

  it("returns null when the todo does not exist", async () => {
    prismaMock.todo.update.mockRejectedValue(notFoundError())

    await expect(
      updateTodoTitle(TODO_ID, "Renamed", USER_ID)
    ).resolves.toBeNull()
  })

  it("rethrows unexpected prisma errors", async () => {
    prismaMock.todo.update.mockRejectedValue(new Error("boom"))

    await expect(updateTodoTitle(TODO_ID, "Renamed", USER_ID)).rejects.toThrow(
      "boom"
    )
  })
})

describe("updateTodoLabel", () => {
  it("clears the label without checking label existence", async () => {
    prismaMock.todo.update.mockResolvedValue(makeTodo({ labelId: null }))

    const result = await updateTodoLabel(TODO_ID, null, USER_ID)

    expect(prismaMock.label.findFirst).not.toHaveBeenCalled()
    expect(prismaMock.todo.update).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
      data: { labelId: null },
    })
    expect(result).toEqual({
      ok: true,
      todo: expect.objectContaining({ labelId: null }),
    })
  })

  it("assigns an existing label", async () => {
    prismaMock.label.findFirst.mockResolvedValue({ id: LABEL_ID })
    prismaMock.todo.update.mockResolvedValue(makeTodo({ labelId: LABEL_ID }))

    const result = await updateTodoLabel(TODO_ID, LABEL_ID, USER_ID)

    expect(prismaMock.label.findFirst).toHaveBeenCalledWith({
      where: { id: LABEL_ID, userId: USER_ID },
      select: { id: true },
    })
    expect(prismaMock.todo.update).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
      data: { labelId: LABEL_ID },
    })
    expect(result).toEqual({
      ok: true,
      todo: expect.objectContaining({ labelId: LABEL_ID }),
    })
  })

  it("reports a missing label and does not update the todo", async () => {
    prismaMock.label.findFirst.mockResolvedValue(null)

    const result = await updateTodoLabel(TODO_ID, LABEL_ID, USER_ID)

    expect(result).toEqual({ ok: false, reason: "label-not-found" })
    expect(prismaMock.todo.update).not.toHaveBeenCalled()
  })

  it("reports a missing todo when the update throws P2025", async () => {
    prismaMock.label.findFirst.mockResolvedValue({ id: LABEL_ID })
    prismaMock.todo.update.mockRejectedValue(notFoundError())

    const result = await updateTodoLabel(TODO_ID, LABEL_ID, USER_ID)

    expect(result).toEqual({ ok: false, reason: "todo-not-found" })
  })

  it("rethrows unexpected prisma errors", async () => {
    prismaMock.label.findFirst.mockResolvedValue({ id: LABEL_ID })
    prismaMock.todo.update.mockRejectedValue(new Error("boom"))

    await expect(updateTodoLabel(TODO_ID, LABEL_ID, USER_ID)).rejects.toThrow(
      "boom"
    )
  })
})

describe("createTodoLabel", () => {
  const labelRow = {
    id: LABEL_ID,
    name: "Errands",
    createdAt: new Date("2024-01-03T00:00:00.000Z"),
    updatedAt: new Date("2024-01-03T00:00:00.000Z"),
    userId: USER_ID,
  }

  it("creates the label on the todo and returns both", async () => {
    prismaMock.todo.update.mockResolvedValue({
      ...makeTodo({ labelId: LABEL_ID }),
      label: labelRow,
    })

    const result = await createTodoLabel(TODO_ID, { name: "Errands" }, USER_ID)

    expect(prismaMock.todo.update).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
      data: { label: { create: { name: "Errands", userId: USER_ID } } },
      include: { label: true },
    })
    expect(result).toEqual({
      ok: true,
      todo: expect.objectContaining({ id: TODO_ID, labelId: LABEL_ID }),
      label: {
        id: LABEL_ID,
        name: "Errands",
        createdAt: "2024-01-03T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
      },
    })
    expect(result.ok && result.todo).not.toHaveProperty("label")
  })

  it("reports a missing todo when the update throws P2025", async () => {
    prismaMock.todo.update.mockRejectedValue(notFoundError())

    const result = await createTodoLabel(TODO_ID, { name: "Errands" }, USER_ID)

    expect(result).toEqual({ ok: false, reason: "todo-not-found" })
  })

  it("reports a duplicate name when the unique constraint fails", async () => {
    prismaMock.todo.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.0.0",
      })
    )

    const result = await createTodoLabel(TODO_ID, { name: "Work" }, USER_ID)

    expect(result).toEqual({ ok: false, reason: "duplicate-name" })
  })

  it("rethrows unexpected prisma errors", async () => {
    prismaMock.todo.update.mockRejectedValue(new Error("boom"))

    await expect(
      createTodoLabel(TODO_ID, { name: "Errands" }, USER_ID)
    ).rejects.toThrow("boom")
  })
})

describe("deleteTodo", () => {
  it("returns true when the todo is deleted", async () => {
    prismaMock.todo.delete.mockResolvedValue(makeTodo())

    await expect(deleteTodo(TODO_ID, USER_ID)).resolves.toBe(true)
    expect(prismaMock.todo.delete).toHaveBeenCalledWith({
      where: { id: TODO_ID, userId: USER_ID },
    })
  })

  it("returns false when the todo does not exist", async () => {
    prismaMock.todo.delete.mockRejectedValue(notFoundError())

    await expect(deleteTodo(TODO_ID, USER_ID)).resolves.toBe(false)
  })

  it("rethrows unexpected prisma errors", async () => {
    prismaMock.todo.delete.mockRejectedValue(new Error("boom"))

    await expect(deleteTodo(TODO_ID, USER_ID)).rejects.toThrow("boom")
  })
})
