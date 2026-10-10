import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const clientMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  patchDone: vi.fn(),
}))
const toastMock = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock("sonner", () => ({ toast: toastMock }))
vi.mock("@/src/lib/api/generated/client", () => ({
  useGetTodos: () => ({ mutate: clientMock.mutate }),
  patchTodosIdDone: clientMock.patchDone,
}))

import { useToggleTodo } from "./use-toggle-todo"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("useToggleTodo", () => {
  it("optimistically toggles, then syncs with the server", async () => {
    clientMock.patchDone.mockResolvedValue({ id: "todo-1", done: true })
    const setMutating = vi.fn()
    const { result } = renderHook(() => useToggleTodo(setMutating))

    await act(async () => {
      await result.current.onToggle("todo-1", true)
    })

    expect(setMutating).toHaveBeenNthCalledWith(1, "todo-1", true)
    expect(setMutating).toHaveBeenLastCalledWith("todo-1", false)
    expect(clientMock.patchDone).toHaveBeenCalledWith("todo-1", { done: true })
    expect(clientMock.mutate).toHaveBeenCalledTimes(2)

    const optimistic = clientMock.mutate.mock.calls[0][0]
    expect(
      optimistic([
        { id: "todo-1", done: false },
        { id: "other", done: false },
      ])
    ).toEqual([
      { id: "todo-1", done: true },
      { id: "other", done: false },
    ])
  })

  it("rolls back and notifies on failure", async () => {
    clientMock.patchDone.mockRejectedValue(new Error("boom"))
    const setMutating = vi.fn()
    const { result } = renderHook(() => useToggleTodo(setMutating))

    await act(async () => {
      await result.current.onToggle("todo-1", true)
    })

    const calls = clientMock.mutate.mock.calls
    const rollback = calls[calls.length - 1][0]
    expect(rollback([{ id: "todo-1", done: true }])).toEqual([
      { id: "todo-1", done: false },
    ])
    expect(toastMock.error).toHaveBeenCalledWith(
      "Failed to update todo. Is the backend running?"
    )
    expect(setMutating).toHaveBeenLastCalledWith("todo-1", false)
  })
})
