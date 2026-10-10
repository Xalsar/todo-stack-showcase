import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const clientMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  patchTitle: vi.fn(),
  data: [] as Array<{ id: string; title: string }> | undefined,
}))
const toastMock = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock("sonner", () => ({ toast: toastMock }))
vi.mock("@/src/lib/api/generated/client", () => ({
  useGetTodos: () => ({ data: clientMock.data, mutate: clientMock.mutate }),
  patchTodosIdTitle: clientMock.patchTitle,
}))

import { useEditTodo } from "./use-edit-todo"

beforeEach(() => {
  vi.clearAllMocks()
  clientMock.data = []
})

describe("useEditTodo", () => {
  it("tracks the editing id", () => {
    const { result } = renderHook(() => useEditTodo(vi.fn()))

    act(() => result.current.onStartEdit("todo-1"))
    expect(result.current.editingId).toBe("todo-1")

    act(() => result.current.onCancelEdit())
    expect(result.current.editingId).toBeNull()
  })

  it("does nothing when the title is unchanged", async () => {
    clientMock.data = [{ id: "todo-1", title: "Same" }]
    const setMutating = vi.fn()
    const { result } = renderHook(() => useEditTodo(setMutating))

    await act(async () => {
      await result.current.onUpdateTitle("todo-1", "Same")
    })

    expect(clientMock.patchTitle).not.toHaveBeenCalled()
    expect(setMutating).not.toHaveBeenCalled()
    expect(result.current.editingId).toBeNull()
  })

  it("does nothing for an unknown todo", async () => {
    const { result } = renderHook(() => useEditTodo(vi.fn()))

    await act(async () => {
      await result.current.onUpdateTitle("missing", "New")
    })

    expect(clientMock.patchTitle).not.toHaveBeenCalled()
  })

  it("does nothing when there is no cache data", async () => {
    clientMock.data = undefined
    const { result } = renderHook(() => useEditTodo(vi.fn()))

    await act(async () => {
      await result.current.onUpdateTitle("todo-1", "New")
    })

    expect(clientMock.patchTitle).not.toHaveBeenCalled()
  })

  it("optimistically updates the title and syncs", async () => {
    clientMock.data = [{ id: "todo-1", title: "Old" }]
    clientMock.patchTitle.mockResolvedValue({ id: "todo-1", title: "New" })
    const setMutating = vi.fn()
    const { result } = renderHook(() => useEditTodo(setMutating))

    await act(async () => {
      await result.current.onUpdateTitle("todo-1", "New")
    })

    expect(clientMock.patchTitle).toHaveBeenCalledWith("todo-1", {
      title: "New",
    })
    expect(clientMock.mutate).toHaveBeenCalledTimes(2)
    expect(result.current.editingId).toBeNull()
    expect(setMutating).toHaveBeenNthCalledWith(1, "todo-1", true)
    expect(setMutating).toHaveBeenLastCalledWith("todo-1", false)
  })

  it("rolls back and notifies on failure", async () => {
    clientMock.data = [{ id: "todo-1", title: "Old" }]
    clientMock.patchTitle.mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useEditTodo(vi.fn()))

    await act(async () => {
      await result.current.onUpdateTitle("todo-1", "New")
    })

    const calls = clientMock.mutate.mock.calls
    const rollback = calls[calls.length - 1][0]
    expect(rollback([{ id: "todo-1", title: "New" }])).toEqual([
      { id: "todo-1", title: "Old" },
    ])
    expect(toastMock.error).toHaveBeenCalledWith(
      "Failed to update todo. Is the backend running?"
    )
  })
})
