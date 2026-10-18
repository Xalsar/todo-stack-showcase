import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  onDelete: vi.fn(),
  labels: [] as Array<{ id: string; name: string }> | undefined,
  todos: [] as Array<{ id: string; labelId: string | null }> | undefined,
}))

vi.mock("@/src/lib/api/generated/client", () => ({
  useGetTodos: () => ({ data: mocks.todos }),
}))
vi.mock("./use-labels", () => ({
  useLabels: () => ({ data: mocks.labels }),
}))
vi.mock("./use-delete-label", () => ({
  useDeleteLabel: () => ({ onDelete: mocks.onDelete, deletingId: "busy" }),
}))

import { useDeleteLabelFlow } from "./use-delete-label-flow"

const work = { id: "label-1", name: "Work" }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.labels = [work]
  mocks.todos = []
})

describe("useDeleteLabelFlow", () => {
  it("exposes the deleting id and no dialog initially", () => {
    const { result } = renderHook(() => useDeleteLabelFlow())

    expect(result.current.deletingId).toBe("busy")
    expect(result.current.deleteDialogProps).toBeNull()
  })

  it("deletes an unused label without opening the dialog", () => {
    const { result } = renderHook(() => useDeleteLabelFlow())

    act(() => result.current.requestDelete(work.id))

    expect(mocks.onDelete).toHaveBeenCalledWith(work.id)
    expect(result.current.deleteDialogProps).toBeNull()
  })

  it("ignores unknown labels", () => {
    const { result } = renderHook(() => useDeleteLabelFlow())

    act(() => result.current.requestDelete("missing"))

    expect(mocks.onDelete).not.toHaveBeenCalled()
    expect(result.current.deleteDialogProps).toBeNull()
  })

  it("opens the dialog with the affected count for a label in use", () => {
    mocks.todos = [
      { id: "todo-1", labelId: work.id },
      { id: "todo-2", labelId: work.id },
      { id: "todo-3", labelId: null },
    ]
    const { result } = renderHook(() => useDeleteLabelFlow())

    act(() => result.current.requestDelete(work.id))

    expect(mocks.onDelete).not.toHaveBeenCalled()
    expect(result.current.deleteDialogProps).toMatchObject({
      open: true,
      labelName: "Work",
      affectedTodos: 2,
    })
  })

  it("opens the dialog when todos haven't loaded yet", () => {
    mocks.todos = undefined
    const { result } = renderHook(() => useDeleteLabelFlow())

    act(() => result.current.requestDelete(work.id))

    expect(result.current.deleteDialogProps).toMatchObject({
      open: true,
      affectedTodos: undefined,
    })
  })

  it("deletes and closes on confirm, then clears once closed", () => {
    mocks.todos = [{ id: "todo-1", labelId: work.id }]
    const { result } = renderHook(() => useDeleteLabelFlow())
    act(() => result.current.requestDelete(work.id))

    act(() => result.current.deleteDialogProps?.onConfirm())

    expect(mocks.onDelete).toHaveBeenCalledWith(work.id)
    expect(result.current.deleteDialogProps).toMatchObject({
      open: false,
      labelName: "Work",
    })

    act(() => result.current.deleteDialogProps?.onClosed())

    expect(result.current.deleteDialogProps).toBeNull()
  })

  it("closes without deleting on close", () => {
    mocks.todos = [{ id: "todo-1", labelId: work.id }]
    const { result } = renderHook(() => useDeleteLabelFlow())
    act(() => result.current.requestDelete(work.id))

    act(() => result.current.deleteDialogProps?.onClose())

    expect(mocks.onDelete).not.toHaveBeenCalled()
    expect(result.current.deleteDialogProps).toMatchObject({ open: false })
  })
})
