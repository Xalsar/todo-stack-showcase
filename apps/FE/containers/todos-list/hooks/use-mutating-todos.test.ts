import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useMutatingTodos } from "./use-mutating-todos"

describe("useMutatingTodos", () => {
  it("starts with no ids mutating", () => {
    const { result } = renderHook(() => useMutatingTodos())

    expect(result.current.isMutating("a")).toBe(false)
  })

  it("marks an id as mutating", () => {
    const { result } = renderHook(() => useMutatingTodos())

    act(() => result.current.setMutating("a", true))

    expect(result.current.isMutating("a")).toBe(true)
  })

  it("clears an id once it is no longer mutating", () => {
    const { result } = renderHook(() => useMutatingTodos())

    act(() => result.current.setMutating("a", true))
    act(() => result.current.setMutating("a", false))

    expect(result.current.isMutating("a")).toBe(false)
  })

  it("tracks ids independently", () => {
    const { result } = renderHook(() => useMutatingTodos())

    act(() => result.current.setMutating("a", true))
    act(() => result.current.setMutating("b", true))
    act(() => result.current.setMutating("a", false))

    expect(result.current.isMutating("a")).toBe(false)
    expect(result.current.isMutating("b")).toBe(true)
  })
})
