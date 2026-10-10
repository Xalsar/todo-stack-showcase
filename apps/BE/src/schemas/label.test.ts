import { describe, expect, it } from "vitest"

import { LabelSchema } from "./label.js"

const valid = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Work",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

describe("LabelSchema", () => {
  it("accepts a well-formed label", () => {
    expect(LabelSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects a non-uuid id", () => {
    expect(LabelSchema.safeParse({ ...valid, id: "nope" }).success).toBe(false)
  })

  it("rejects a non-string name", () => {
    expect(LabelSchema.safeParse({ ...valid, name: 1 }).success).toBe(false)
  })

  it("rejects a non-datetime updatedAt", () => {
    expect(
      LabelSchema.safeParse({ ...valid, updatedAt: "not-a-date" }).success
    ).toBe(false)
  })
})
