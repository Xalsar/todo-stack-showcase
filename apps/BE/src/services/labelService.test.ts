import { beforeEach, describe, expect, it, vi } from "vitest"

const prismaMock = vi.hoisted(() => ({
  label: {
    findMany: vi.fn(),
  },
}))

vi.mock("../lib/prisma.js", () => ({ prisma: prismaMock }))

import { listLabels } from "./labelService.js"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("listLabels", () => {
  it("queries labels alphabetically and maps them to DTOs", async () => {
    prismaMock.label.findMany.mockResolvedValue([
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Work",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      },
    ])

    const result = await listLabels()

    expect(prismaMock.label.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
    })
    expect(result).toEqual([
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Work",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
    ])
  })

  it("returns an empty array when there are no labels", async () => {
    prismaMock.label.findMany.mockResolvedValue([])

    await expect(listLabels()).resolves.toEqual([])
  })
})
