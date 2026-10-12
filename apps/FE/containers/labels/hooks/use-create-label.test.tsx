import { act, renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Label } from "@/src/lib/api/generated/model"

import { LabelNameConflictError } from "../label-errors"

const getLabels = vi.hoisted(() => vi.fn())
const postLabels = vi.hoisted(() => vi.fn())

vi.mock("@/src/lib/api/generated/client", async () => {
  const useSwr = (await import("swr")).default
  return {
    useGetLabels: () => useSwr(["/labels"], getLabels),
    postLabels,
  }
})

const toastMock = vi.hoisted(() => ({ error: vi.fn() }))
vi.mock("sonner", () => ({ toast: toastMock }))

import { useCreateLabel } from "./use-create-label"
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

async function renderCreate() {
  const rendered = renderHook(
    () => ({ labels: useLabels(), create: useCreateLabel() }),
    { wrapper }
  )
  await waitFor(() =>
    expect(rendered.result.current.labels.data).toEqual([work, home])
  )
  return rendered
}

describe("useCreateLabel", () => {
  it("optimistically adds then replaces with the created label", async () => {
    const created: Label = {
      id: "3",
      name: "Errands",
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
    }
    postLabels.mockResolvedValue(created)
    const { result } = await renderCreate()

    await act(async () => {
      await result.current.create.onCreate("Errands")
    })

    expect(postLabels).toHaveBeenCalledWith({ name: "Errands" })
    expect(result.current.labels.data).toEqual([work, home, created])
    expect(result.current.create.failed).toBe(false)
  })

  it("rejects duplicate names without calling the API", async () => {
    const { result } = await renderCreate()

    await expect(
      act(async () => {
        await result.current.create.onCreate("work")
      })
    ).rejects.toBeInstanceOf(LabelNameConflictError)
    expect(postLabels).not.toHaveBeenCalled()
  })

  it("rolls back and notifies on failure", async () => {
    postLabels.mockRejectedValue(new Error("boom"))
    const { result } = await renderCreate()

    await act(async () => {
      await result.current.create.onCreate("Errands")
    })

    expect(result.current.labels.data).toEqual([work, home])
    expect(result.current.create.failed).toBe(true)
    expect(toastMock.error).toHaveBeenCalledWith(
      "Failed to create label. Is the backend running?"
    )
  })
})
