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

import { useLabelTodo } from "./use-label-todo"

beforeEach(() => {
  vi.clearAllMocks()
  clientMock.data = []
})

describe("useLabelTodo", () => {
  it("does nothing when the label is unchanged", async () => {
    clientMock.data = [{ id: "todo-1", labelId: "label-1" }]
    const setMutating = vi.fn()
    const { result } = renderHook(() => useLabelTodo(setMutating))

    await act(async () => {
      await result.current.onLabel("todo-1", "label-1")
    })

    expect(clientMock.patchLabel).not.toHaveBeenCalled()
    expect(setMutating).not.toHaveBeenCalled()
  })

  it("does nothing for an unknown todo", async () => {
    const { result } = renderHook(() => useLabelTodo(vi.fn()))

    await act(async () => {
      await result.current.onLabel("missing", "label-1")
    })

    expect(clientMock.patchLabel).not.toHaveBeenCalled()
  })

  it("does nothing when there is no cache data", async () => {
    clientMock.data = undefined
    const { result } = renderHook(() => useLabelTodo(vi.fn()))

    await act(async () => {
      await result.current.onLabel("todo-1", "label-1")
    })

    expect(clientMock.patchLabel).not.toHaveBeenCalled()
  })

  it("optimistically assigns the label and syncs", async () => {
    clientMock.data = [{ id: "todo-1", labelId: null }]
    clientMock.patchLabel.mockResolvedValue({
      id: "todo-1",
      labelId: "label-1",
    })
    const setMutating = vi.fn()
    const { result } = renderHook(() => useLabelTodo(setMutating))

    await act(async () => {
      await result.current.onLabel("todo-1", "label-1")
    })

    expect(clientMock.patchLabel).toHaveBeenCalledWith("todo-1", {
      labelId: "label-1",
    })
    expect(clientMock.mutate).toHaveBeenCalledTimes(2)
    expect(setMutating).toHaveBeenNthCalledWith(1, "todo-1", true)
    expect(setMutating).toHaveBeenLastCalledWith("todo-1", false)
  })

  it("rolls back and notifies on failure", async () => {
    clientMock.data = [{ id: "todo-1", labelId: null }]
    clientMock.patchLabel.mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useLabelTodo(vi.fn()))

    await act(async () => {
      await result.current.onLabel("todo-1", "label-1")
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
