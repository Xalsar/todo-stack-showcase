import { Prisma } from "@prisma/client"
import { beforeEach, describe, expect, it, vi } from "vitest"

const prismaMock = vi.hoisted(() => ({
  label: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("../lib/prisma.js", () => ({ prisma: prismaMock }))

import {
  createLabel,
  deleteLabel,
  listLabels,
  updateLabel,
} from "./labelService.js"

const USER_ID = "user-1"
const LABEL_ID = "22222222-2222-4222-8222-222222222222"

const baseLabel = {
  id: LABEL_ID,
  name: "Work",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-02T00:00:00.000Z"),
}

const dto = {
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
})

describe("listLabels", () => {
  it("queries the user's labels alphabetically and maps them to DTOs", async () => {
    prismaMock.label.findMany.mockResolvedValue([baseLabel])

    const result = await listLabels(USER_ID)

    expect(prismaMock.label.findMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      orderBy: { name: "asc" },
    })
    expect(result).toEqual([dto])
  })

  it("returns an empty array when there are no labels", async () => {
    prismaMock.label.findMany.mockResolvedValue([])

    await expect(listLabels(USER_ID)).resolves.toEqual([])
  })
})

describe("createLabel", () => {
  it("creates a label scoped to the user and returns its DTO", async () => {
    prismaMock.label.create.mockResolvedValue(baseLabel)

    const result = await createLabel({ name: "Work" }, USER_ID)

    expect(prismaMock.label.create).toHaveBeenCalledWith({
      data: { name: "Work", userId: USER_ID },
    })
    expect(result).toEqual({ ok: true, label: dto })
  })

  it("reports a duplicate name when the unique constraint fails", async () => {
    prismaMock.label.create.mockRejectedValue(uniqueConstraintError())

    const result = await createLabel({ name: "Work" }, USER_ID)

    expect(result).toEqual({ ok: false, reason: "duplicate-name" })
  })

  it("rethrows unexpected prisma errors", async () => {
    prismaMock.label.create.mockRejectedValue(new Error("boom"))

    await expect(createLabel({ name: "Work" }, USER_ID)).rejects.toThrow("boom")
  })
})

describe("updateLabel", () => {
  it("renames the user's label and returns its DTO", async () => {
    prismaMock.label.update.mockResolvedValue({ ...baseLabel, name: "Office" })

    const result = await updateLabel(LABEL_ID, { name: "Office" }, USER_ID)

    expect(prismaMock.label.update).toHaveBeenCalledWith({
      where: { id: LABEL_ID, userId: USER_ID },
      data: { name: "Office" },
    })
    expect(result).toEqual({ ok: true, label: { ...dto, name: "Office" } })
  })

  it("reports a missing label", async () => {
    prismaMock.label.update.mockRejectedValue(notFoundError())

    const result = await updateLabel(LABEL_ID, { name: "Office" }, USER_ID)

    expect(result).toEqual({ ok: false, reason: "not-found" })
  })

  it("reports a duplicate name when the unique constraint fails", async () => {
    prismaMock.label.update.mockRejectedValue(uniqueConstraintError())

    const result = await updateLabel(LABEL_ID, { name: "Home" }, USER_ID)

    expect(result).toEqual({ ok: false, reason: "duplicate-name" })
  })

  it("rethrows unexpected prisma errors", async () => {
    prismaMock.label.update.mockRejectedValue(new Error("boom"))

    await expect(
      updateLabel(LABEL_ID, { name: "Office" }, USER_ID)
    ).rejects.toThrow("boom")
  })
})

describe("deleteLabel", () => {
  it("deletes the user's label", async () => {
    prismaMock.label.delete.mockResolvedValue(baseLabel)

    await expect(deleteLabel(LABEL_ID, USER_ID)).resolves.toBe(true)
    expect(prismaMock.label.delete).toHaveBeenCalledWith({
      where: { id: LABEL_ID, userId: USER_ID },
    })
  })

  it("returns false when the label does not exist", async () => {
    prismaMock.label.delete.mockRejectedValue(notFoundError())

    await expect(deleteLabel(LABEL_ID, USER_ID)).resolves.toBe(false)
  })

  it("rethrows unexpected prisma errors", async () => {
    prismaMock.label.delete.mockRejectedValue(new Error("boom"))

    await expect(deleteLabel(LABEL_ID, USER_ID)).rejects.toThrow("boom")
  })
})
