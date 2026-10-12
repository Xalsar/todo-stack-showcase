import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Label } from "@/src/lib/api/generated/model"

const getLabels = vi.hoisted(() => vi.fn())

vi.mock("@/src/lib/api/generated/client", async () => {
  const useSwr = (await import("swr")).default
  return {
    useGetLabels: () => useSwr(["/labels"], getLabels),
  }
})

import { useLabels } from "./use-labels"

const swrConfig = { provider: () => new Map(), dedupingInterval: 0 }

function wrapper({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}

const work: Label = {
  id: "1",
  name: "Work",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("useLabels", () => {
  it("loads labels through the generated client", async () => {
    getLabels.mockResolvedValue([work])

    const { result } = renderHook(() => useLabels(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual([work]))
    expect(getLabels).toHaveBeenCalled()
  })

  it("exposes an error when the request rejects", async () => {
    const failure = new Error("boom")
    getLabels.mockRejectedValue(failure)

    const { result } = renderHook(() => useLabels(), { wrapper })

    await waitFor(() => expect(result.current.error).toBe(failure))
  })
})
