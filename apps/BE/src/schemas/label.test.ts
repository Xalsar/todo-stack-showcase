import { describe, expect, it } from "vitest"

import {
  CreateLabelSchema,
  LabelIdParamsSchema,
  LabelSchema,
  UpdateLabelSchema,
} from "./label.js"

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

describe("CreateLabelSchema", () => {
  it("accepts a non-empty name", () => {
    expect(CreateLabelSchema.safeParse({ name: "Work" }).success).toBe(true)
  })

  it("rejects an empty name", () => {
    expect(CreateLabelSchema.safeParse({ name: "" }).success).toBe(false)
  })

  it("rejects a missing name", () => {
    expect(CreateLabelSchema.safeParse({}).success).toBe(false)
  })
})

describe("UpdateLabelSchema", () => {
  it("rejects an empty name", () => {
    expect(UpdateLabelSchema.safeParse({ name: "" }).success).toBe(false)
  })
})

describe("LabelIdParamsSchema", () => {
  it("accepts a uuid id", () => {
    expect(
      LabelIdParamsSchema.safeParse({
        id: "22222222-2222-4222-8222-222222222222",
      }).success
    ).toBe(true)
  })

  it("rejects a non-uuid id", () => {
    expect(LabelIdParamsSchema.safeParse({ id: "nope" }).success).toBe(false)
  })
})
