import { describe, expect, it } from "vitest"

import { ApiError } from "@/src/lib/api/fetcher"

import { isNameConflict, LabelNameConflictError } from "./label-errors"

describe("label-errors", () => {
  it("marks conflicts with a 409 status", () => {
    const error = new LabelNameConflictError("Work")

    expect(error.status).toBe(409)
    expect(error.name).toBe("LabelNameConflictError")
    expect(error.message).toContain("Work")
  })

  it("detects name conflicts", () => {
    expect(isNameConflict(new LabelNameConflictError("Work"))).toBe(true)
    expect(isNameConflict(new ApiError(409, "conflict"))).toBe(true)
    expect(isNameConflict(new ApiError(500, "boom"))).toBe(false)
    expect(isNameConflict(new Error("boom"))).toBe(false)
  })
})
