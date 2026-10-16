import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const clientMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  patchLabel: vi.fn(),
  data: [] as Array<{ id: string; labelId: string | null }> | undefined,
}))
const toastMock = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock("sonner", () => ({ toast: toastMock }))
vi.mock("@/src/lib/api/generated/client", () => ({
  useGetTodos: () => ({ data: clientMock.data, mutate: clientMock.mutate }),
  patchTodosIdLabel: clientMock.patchLabel,
}))

import { useApplyLabelToTodo } from "./use-apply-label-to-todo"

beforeEach(() => {
  vi.clearAllMocks()
  clientMock.data = []
})

describe("useApplyLabelToTodo", () => {
  it("does nothing when the label is unchanged", async () => {
    clientMock.data = [{ id: "todo-1", labelId: "label-1" }]
    const { result } = renderHook(() => useApplyLabelToTodo())

    await act(async () => {
      await result.current.applyLabel("todo-1", "label-1")
    })

    expect(clientMock.patchLabel).not.toHaveBeenCalled()
    expect(clientMock.mutate).not.toHaveBeenCalled()
  })

  it("does nothing for an unknown todo", async () => {
    const { result } = renderHook(() => useApplyLabelToTodo())

    await act(async () => {
      await result.current.applyLabel("missing", "label-1")
    })

    expect(clientMock.patchLabel).not.toHaveBeenCalled()
  })

  it("does nothing when there is no cache data", async () => {
    clientMock.data = undefined
    const { result } = renderHook(() => useApplyLabelToTodo())

    await act(async () => {
      await result.current.applyLabel("todo-1", "label-1")
    })

    expect(clientMock.patchLabel).not.toHaveBeenCalled()
  })

  it("optimistically assigns the label and syncs", async () => {
    clientMock.data = [{ id: "todo-1", labelId: null }]
    clientMock.patchLabel.mockResolvedValue({
      id: "todo-1",
      labelId: "label-1",
    })
    const { result } = renderHook(() => useApplyLabelToTodo())

    await act(async () => {
      await result.current.applyLabel("todo-1", "label-1")
    })

    expect(clientMock.patchLabel).toHaveBeenCalledWith("todo-1", {
      labelId: "label-1",
    })
    expect(clientMock.mutate).toHaveBeenCalledTimes(2)
  })

  it("rolls back and notifies on failure", async () => {
    clientMock.data = [{ id: "todo-1", labelId: null }]
    clientMock.patchLabel.mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useApplyLabelToTodo())

    await act(async () => {
      await result.current.applyLabel("todo-1", "label-1")
    })

    const calls = clientMock.mutate.mock.calls
    const rollback = calls[calls.length - 1][0]
    expect(rollback([{ id: "todo-1", labelId: "label-1" }])).toEqual([
      { id: "todo-1", labelId: null },
    ])
    expect(toastMock.error).toHaveBeenCalledWith(
      "Failed to update label. Is the backend running?"
    )
  })
})
