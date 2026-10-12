import { act, renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Label } from "@/src/lib/api/generated/model"

import { LabelNameConflictError } from "../label-errors"

const getLabels = vi.hoisted(() => vi.fn())
const patchLabelsId = vi.hoisted(() => vi.fn())

vi.mock("@/src/lib/api/generated/client", async () => {
  const useSwr = (await import("swr")).default
  return {
    useGetLabels: () => useSwr(["/labels"], getLabels),
    patchLabelsId,
  }
})

const toastMock = vi.hoisted(() => ({ error: vi.fn() }))
vi.mock("sonner", () => ({ toast: toastMock }))

import { useLabels } from "./use-labels"
import { useRenameLabel } from "./use-rename-label"

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

async function renderRename() {
  const rendered = renderHook(
    () => ({ labels: useLabels(), rename: useRenameLabel() }),
    { wrapper }
  )
  await waitFor(() =>
    expect(rendered.result.current.labels.data).toEqual([work, home])
  )
  return rendered
}

describe("useRenameLabel", () => {
  it("optimistically renames and syncs with the response", async () => {
    patchLabelsId.mockResolvedValue({ ...work, name: "Office" })
    const { result } = await renderRename()

    await act(async () => {
      await result.current.rename.onRename("1", "Office")
    })

    expect(patchLabelsId).toHaveBeenCalledWith("1", { name: "Office" })
    expect(result.current.labels.data?.[0]?.name).toBe("Office")
  })

  it("rejects renaming to another label's name", async () => {
    const { result } = await renderRename()

    await expect(
      act(async () => {
        await result.current.rename.onRename("1", "home")
      })
    ).rejects.toBeInstanceOf(LabelNameConflictError)
    expect(patchLabelsId).not.toHaveBeenCalled()
  })

  it("allows renaming a label to its own name", async () => {
    patchLabelsId.mockResolvedValue({ ...work, name: "Work" })
    const { result } = await renderRename()

    await act(async () => {
      await result.current.rename.onRename("1", "Work")
    })

    expect(patchLabelsId).toHaveBeenCalledWith("1", { name: "Work" })
  })

  it("rolls back and notifies on failure", async () => {
    patchLabelsId.mockRejectedValue(new Error("boom"))
    const { result } = await renderRename()

    await act(async () => {
      await result.current.rename.onRename("1", "Office")
    })

    expect(result.current.labels.data?.[0]?.name).toBe("Work")
    expect(toastMock.error).toHaveBeenCalledWith(
      "Failed to rename label. Is the backend running?"
    )
  })
})
