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

beforeEach(() => {
  vi.clearAllMocks()
  getSessionMock.mockResolvedValue({ user: { id: USER_ID } })
})

describe("GET /labels", () => {
  it("returns the labels", async () => {
    prismaMock.label.findMany.mockResolvedValue([
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Work",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      },
    ])

    const res = await request(app).get("/labels")

    expect(res.status).toBe(200)
    expect(prismaMock.label.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
    })
    expect(res.body).toEqual([
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Work",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
    ])
  })

  it("rejects unauthenticated requests", async () => {
    getSessionMock.mockResolvedValue(null)

    const res = await request(app).get("/labels")

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Unauthorized" })
    expect(prismaMock.label.findMany).not.toHaveBeenCalled()
  })
})
