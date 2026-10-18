import { act, renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Label } from "@/src/lib/api/generated/model"

const getLabels = vi.hoisted(() => vi.fn())
const deleteLabelsId = vi.hoisted(() => vi.fn())
const todos = vi.hoisted(() => ({
  mutate: vi.fn(),
  data: [] as Array<{ id: string; labelId: string | null }>,
}))

vi.mock("@/src/lib/api/generated/client", async () => {
  const useSwr = (await import("swr")).default
  return {
    useGetLabels: () => useSwr(["/labels"], getLabels),
    deleteLabelsId,
    useGetTodos: () => ({ data: todos.data, mutate: todos.mutate }),
  }
})

const toastMock = vi.hoisted(() => ({ error: vi.fn() }))
vi.mock("sonner", () => ({ toast: toastMock }))

import { useDeleteLabel } from "./use-delete-label"
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
const home: Label = {
  id: "2",
  name: "Home",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  getLabels.mockResolvedValue([work, home])
  todos.data = []
})

async function renderDelete() {
  const rendered = renderHook(
    () => ({ labels: useLabels(), remove: useDeleteLabel() }),
    { wrapper }
  )
  await waitFor(() =>
    expect(rendered.result.current.labels.data).toEqual([work, home])
  )
  return rendered
}

describe("useDeleteLabel", () => {
  it("removes the label and clears it from todos", async () => {
    deleteLabelsId.mockResolvedValue(undefined)
    const { result } = await renderDelete()

    let deleted: boolean
    await act(async () => {
      deleted = await result.current.remove.onDelete("1")
    })

    expect(deleted!).toBe(true)
    expect(deleteLabelsId).toHaveBeenCalledWith("1")
    expect(result.current.labels.data).toEqual([home])

    const clearLabel = todos.mutate.mock.calls[0][0] as (
      current: Array<{ id: string; labelId: string | null }>
    ) => Array<{ id: string; labelId: string | null }>
    expect(
      clearLabel([
        { id: "t1", labelId: "1" },
        { id: "t2", labelId: "2" },
      ])
    ).toEqual([
      { id: "t1", labelId: null },
      { id: "t2", labelId: "2" },
    ])
  })

  it("rolls back and notifies on failure", async () => {
    deleteLabelsId.mockRejectedValue(new Error("boom"))
    const { result } = await renderDelete()

    let deleted: boolean
    await act(async () => {
      deleted = await result.current.remove.onDelete("1")
    })

    expect(deleted!).toBe(false)
    expect(result.current.labels.data).toEqual([work, home])
    expect(toastMock.error).toHaveBeenCalledWith(
      "Failed to delete label. Is the backend running?"
    )
  })

  it("restores the label at its original position on failure", async () => {
    deleteLabelsId.mockRejectedValue(new Error("boom"))
    const { result } = await renderDelete()

    await act(async () => {
      await result.current.remove.onDelete("2")
    })

    expect(result.current.labels.data).toEqual([work, home])
  })

  it("restores the label on affected todos the user hasn't relabeled", async () => {
    deleteLabelsId.mockRejectedValue(new Error("boom"))
    todos.data = [
      { id: "t1", labelId: "1" },
      { id: "t2", labelId: "1" },
      { id: "t3", labelId: "2" },
    ]
    const { result } = await renderDelete()

    await act(async () => {
      await result.current.remove.onDelete("1")
    })

    const restore = todos.mutate.mock.calls[1]?.[0] as (
      current: Array<{ id: string; labelId: string | null }>
    ) => Array<{ id: string; labelId: string | null }>
    // t2 was relabeled while the request was in flight; t4 never had it.
    expect(
      restore([
        { id: "t1", labelId: null },
        { id: "t2", labelId: "2" },
        { id: "t3", labelId: "2" },
        { id: "t4", labelId: null },
      ])
    ).toEqual([
      { id: "t1", labelId: "1" },
      { id: "t2", labelId: "2" },
      { id: "t3", labelId: "2" },
      { id: "t4", labelId: null },
    ])
  })
})
