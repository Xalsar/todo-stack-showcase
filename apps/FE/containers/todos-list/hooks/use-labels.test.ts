import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const labelsResult = { data: [{ id: "label-1" }], isLoading: false }

vi.mock("@/src/lib/api/generated/client", () => ({
  useGetLabels: () => labelsResult,
}))

import { useLabels } from "./use-labels"

describe("useLabels", () => {
  it("returns the labels query result", () => {
    const { result } = renderHook(() => useLabels())

    expect(result.current).toBe(labelsResult)
  })
})
