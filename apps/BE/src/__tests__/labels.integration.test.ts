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
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("../lib/prisma.js", () => ({ prisma: prismaMock }))

import { app } from "../app.js"

const USER_ID = "user-1"
const LABEL_ID = "22222222-2222-4222-8222-222222222222"

const baseLabel = {
  id: LABEL_ID,
  name: "Work",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-02T00:00:00.000Z"),
}

const labelDto = {
  id: LABEL_ID,
  name: "Work",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
}

function notFoundError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Record not found", {
    code: "P2025",
    clientVersion: "6.0.0",
  })
}

function uniqueConstraintError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.0.0",
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  getSessionMock.mockResolvedValue({ user: { id: USER_ID } })
})

describe("GET /labels", () => {
  it("returns the authenticated user's labels", async () => {
    prismaMock.label.findMany.mockResolvedValue([baseLabel])

    const res = await request(app).get("/labels")

    expect(res.status).toBe(200)
    expect(prismaMock.label.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      orderBy: { name: "asc" },
    })
    expect(res.body).toEqual([labelDto])
  })

  it("rejects unauthenticated requests", async () => {
    getSessionMock.mockResolvedValue(null)

    const res = await request(app).get("/labels")

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Unauthorized" })
    expect(prismaMock.label.findMany).not.toHaveBeenCalled()
  })
})

describe("POST /labels", () => {
  it("creates a label for the authenticated user", async () => {
    prismaMock.label.create.mockResolvedValue({ ...baseLabel, name: "Errands" })

    const res = await request(app).post("/labels").send({ name: "Errands" })

    expect(res.status).toBe(201)
    expect(prismaMock.label.create).toHaveBeenCalledWith({
      data: { name: "Errands", userId: USER_ID },
    })
    expect(res.body).toEqual({ ...labelDto, name: "Errands" })
  })

  it("rejects an empty name with 400", async () => {
    const res = await request(app).post("/labels").send({ name: "" })

    expect(res.status).toBe(400)
    expect(prismaMock.label.create).not.toHaveBeenCalled()
  })

  it("returns 409 when the name already exists", async () => {
    prismaMock.label.create.mockRejectedValue(uniqueConstraintError())

    const res = await request(app).post("/labels").send({ name: "Work" })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      error: "A label with this name already exists",
    })
  })
})

describe("PATCH /labels/:id", () => {
  it("renames the label", async () => {
    prismaMock.label.update.mockResolvedValue({ ...baseLabel, name: "Office" })

    const res = await request(app)
      .patch(`/labels/${LABEL_ID}`)
      .send({ name: "Office" })

    expect(res.status).toBe(200)
    expect(prismaMock.label.update).toHaveBeenCalledWith({
      where: { id: LABEL_ID, userId: USER_ID },
      data: { name: "Office" },
    })
    expect(res.body.name).toBe("Office")
  })

  it("rejects an empty name with 400", async () => {
    const res = await request(app)
      .patch(`/labels/${LABEL_ID}`)
      .send({ name: "" })

    expect(res.status).toBe(400)
    expect(prismaMock.label.update).not.toHaveBeenCalled()
  })

  it("rejects a non-uuid id with 400", async () => {
    const res = await request(app).patch("/labels/nope").send({ name: "x" })

    expect(res.status).toBe(400)
    expect(prismaMock.label.update).not.toHaveBeenCalled()
  })

  it("returns 404 for a missing label", async () => {
    prismaMock.label.update.mockRejectedValue(notFoundError())

    const res = await request(app)
      .patch(`/labels/${LABEL_ID}`)
      .send({ name: "Office" })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Label not found" })
  })

  it("returns 409 when the new name already exists", async () => {
    prismaMock.label.update.mockRejectedValue(uniqueConstraintError())

    const res = await request(app)
      .patch(`/labels/${LABEL_ID}`)
      .send({ name: "Home" })

    expect(res.status).toBe(409)
  })
})

describe("DELETE /labels/:id", () => {
  it("deletes the label with 204", async () => {
    prismaMock.label.delete.mockResolvedValue(baseLabel)

    const res = await request(app).delete(`/labels/${LABEL_ID}`)

    expect(res.status).toBe(204)
    expect(prismaMock.label.delete).toHaveBeenCalledWith({
      where: { id: LABEL_ID, userId: USER_ID },
    })
  })

  it("returns 404 for a missing label", async () => {
    prismaMock.label.delete.mockRejectedValue(notFoundError())

    const res = await request(app).delete(`/labels/${LABEL_ID}`)

    expect(res.status).toBe(404)
  })

  it("rejects a non-uuid id with 400", async () => {
    const res = await request(app).delete("/labels/nope")

    expect(res.status).toBe(400)
    expect(prismaMock.label.delete).not.toHaveBeenCalled()
  })
})
