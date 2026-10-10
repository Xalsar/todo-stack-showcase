import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const clientMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  trigger: vi.fn(),
}))

vi.mock("@/src/lib/api/generated/client", () => ({
  useGetTodos: () => ({ mutate: clientMock.mutate }),
  usePostTodos: () => ({ trigger: clientMock.trigger }),
}))

import { useCreateTodo } from "./use-create-todo"

const createdTodo = {
  id: "1",
  title: "Buy milk",
  done: false,
  labelId: null,
  userId: "user-1",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  clientMock.mutate.mockResolvedValue(undefined)
})

describe("useCreateTodo", () => {
  it("creates the todo and prepends it optimistically", async () => {
    clientMock.trigger.mockResolvedValue(createdTodo)
    const { result } = renderHook(() => useCreateTodo())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.onSubmit("Buy milk")
    })

    expect(ok).toBe(true)
    expect(clientMock.trigger).toHaveBeenCalledWith(
      { title: "Buy milk" },
      { revalidate: false }
    )
    expect(clientMock.mutate).toHaveBeenCalledTimes(1)

    const [updater, options] = clientMock.mutate.mock.calls[0]
    expect(options).toEqual({ revalidate: false })
    const existing = [{ id: "old" }]
    expect(updater(existing)).toEqual([createdTodo, ...existing])
  })

  it("prepends to an empty list when there is no current data", async () => {
    clientMock.trigger.mockResolvedValue(createdTodo)
    const { result } = renderHook(() => useCreateTodo())

    await act(async () => {
      await result.current.onSubmit("Buy milk")
    })

    const [updater] = clientMock.mutate.mock.calls[0]
    expect(updater(undefined)).toEqual([createdTodo])
  })

  it("flags failure and returns false when creation rejects", async () => {
    clientMock.trigger.mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useCreateTodo())

    let ok: boolean | undefined
    await act(async () => {
      ok = await result.current.onSubmit("Buy milk")
    })

    expect(ok).toBe(false)
    expect(result.current.failed).toBe(true)
    expect(result.current.isSubmitting).toBe(false)
    expect(clientMock.mutate).not.toHaveBeenCalled()
  })

  it("toggles isSubmitting while the request is in flight", async () => {
    let resolveTrigger: (value: unknown) => void = () => {}
    clientMock.trigger.mockReturnValue(
      new Promise((resolve) => {
        resolveTrigger = resolve
      })
    )
    const { result } = renderHook(() => useCreateTodo())

    let pending: Promise<boolean> | undefined
    act(() => {
      pending = result.current.onSubmit("Buy milk")
    })
    expect(result.current.isSubmitting).toBe(true)

    await act(async () => {
      resolveTrigger(createdTodo)
      await pending
    })
    expect(result.current.isSubmitting).toBe(false)
  })

  it("clears a previous failure on the next attempt", async () => {
    clientMock.trigger.mockRejectedValueOnce(new Error("boom"))
    const { result } = renderHook(() => useCreateTodo())

    await act(async () => {
      await result.current.onSubmit("Buy milk")
    })
    expect(result.current.failed).toBe(true)

    clientMock.trigger.mockResolvedValueOnce(createdTodo)
    await act(async () => {
      await result.current.onSubmit("Buy milk")
    })
    expect(result.current.failed).toBe(false)
  })
})
