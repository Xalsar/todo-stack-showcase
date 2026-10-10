import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const clientMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  deleteTodo: vi.fn(),
  data: [] as Array<{ id: string }> | undefined,
}))
const toastMock = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock("sonner", () => ({ toast: toastMock }))
vi.mock("@/src/lib/api/generated/client", () => ({
  useGetTodos: () => ({ data: clientMock.data, mutate: clientMock.mutate }),
  deleteTodosId: clientMock.deleteTodo,
}))

import { useDeleteTodo } from "./use-delete-todo"

beforeEach(() => {
  vi.clearAllMocks()
  clientMock.data = []
})

describe("useDeleteTodo", () => {
  it("optimistically removes the todo", async () => {
    clientMock.data = [{ id: "todo-1" }]
    clientMock.deleteTodo.mockResolvedValue(undefined)
    const setMutating = vi.fn()
    const { result } = renderHook(() => useDeleteTodo(setMutating))

    await act(async () => {
      await result.current.onDelete("todo-1")
    })

    expect(clientMock.deleteTodo).toHaveBeenCalledWith("todo-1")
    const remove = clientMock.mutate.mock.calls[0][0]
    expect(remove([{ id: "todo-1" }, { id: "x" }])).toEqual([{ id: "x" }])
    expect(setMutating).toHaveBeenNthCalledWith(1, "todo-1", true)
    expect(setMutating).toHaveBeenLastCalledWith("todo-1", false)
  })

  it("restores the todo and notifies on failure", async () => {
    clientMock.data = [{ id: "todo-1" }, { id: "x" }]
    clientMock.deleteTodo.mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useDeleteTodo(vi.fn()))

    await act(async () => {
      await result.current.onDelete("todo-1")
    })

    const calls = clientMock.mutate.mock.calls
    const restore = calls[calls.length - 1][0]
    expect(restore([{ id: "x" }])).toEqual([{ id: "todo-1" }, { id: "x" }])
    expect(toastMock.error).toHaveBeenCalledWith(
      "Failed to delete todo. Is the backend running?"
    )
  })

  it("does not restore when the todo is not in the cache", async () => {
    clientMock.data = [{ id: "x" }]
    clientMock.deleteTodo.mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useDeleteTodo(vi.fn()))

    await act(async () => {
      await result.current.onDelete("todo-1")
    })

    expect(clientMock.mutate).toHaveBeenCalledTimes(1)
    expect(toastMock.error).toHaveBeenCalledTimes(1)
  })

  it("does not restore when there is no cache data", async () => {
    clientMock.data = undefined
    clientMock.deleteTodo.mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useDeleteTodo(vi.fn()))

    await act(async () => {
      await result.current.onDelete("todo-1")
    })

    expect(clientMock.mutate).toHaveBeenCalledTimes(1)
    expect(toastMock.error).toHaveBeenCalledTimes(1)
  })
})
