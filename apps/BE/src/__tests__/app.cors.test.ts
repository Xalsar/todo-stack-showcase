import request from "supertest"
import { afterEach, describe, expect, it, vi } from "vitest"

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

import { app, getCorsOrigin } from "../app.js"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("getCorsOrigin", () => {
  it("defaults to localhost:3000 when unset", () => {
    vi.stubEnv("CORS_ORIGIN", undefined)

    expect(getCorsOrigin()).toBe("http://localhost:3000")
  })

  it("uses CORS_ORIGIN when configured", () => {
    vi.stubEnv("CORS_ORIGIN", "http://example.com")

    expect(getCorsOrigin()).toBe("http://example.com")
  })
})

describe("app CORS", () => {
  it("allows the default origin", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user-1" } })
    prismaMock.todo.findMany.mockResolvedValue([])

    const res = await request(app)
      .get("/todos")
      .set("Origin", "http://localhost:3000")

    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    )
  })
})
