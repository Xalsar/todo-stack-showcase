import { act, renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Label } from "@/src/lib/api/generated/model"

const getLabels = vi.hoisted(() => vi.fn())
const deleteLabelsId = vi.hoisted(() => vi.fn())
const todos = vi.hoisted(() => ({ mutate: vi.fn(), data: [] }))

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
})
