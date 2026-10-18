import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useLabelManager } from "../store/label-manager"

const mocks = vi.hoisted(() => ({
  applyLabel: vi.fn(),
  todos: [] as Array<{ id: string; labelId: string | null }> | undefined,
}))

vi.mock("@/src/lib/api/generated/client", () => ({
  useGetTodos: () => ({ data: mocks.todos }),
}))
vi.mock("./use-apply-label-to-todo", () => ({
  useApplyLabelToTodo: () => ({ applyLabel: mocks.applyLabel }),
}))

import { useTodoLabelSelection } from "./use-todo-label-selection"

beforeEach(() => {
  vi.clearAllMocks()
  mocks.todos = [{ id: "todo-1", labelId: "label-1" }]
  useLabelManager.setState({ selectedTodo: null })
})

describe("useTodoLabelSelection", () => {
  it("has no selection and ignores selects when not scoped to a todo", () => {
    const { result } = renderHook(() => useTodoLabelSelection())

    act(() => result.current.selectLabel("label-2"))

    expect(result.current.selectedLabelId).toBeUndefined()
    expect(mocks.applyLabel).not.toHaveBeenCalled()
  })

  it("returns the selected todo's label", () => {
    useLabelManager.setState({ selectedTodo: { todoId: "todo-1" } })
    const { result } = renderHook(() => useTodoLabelSelection())

    expect(result.current.selectedLabelId).toBe("label-1")
  })

  it("returns null when the selected todo isn't found", () => {
    useLabelManager.setState({ selectedTodo: { todoId: "missing" } })
    const { result } = renderHook(() => useTodoLabelSelection())

    expect(result.current.selectedLabelId).toBeNull()
  })

  it("applies the chosen label to the selected todo", () => {
    useLabelManager.setState({ selectedTodo: { todoId: "todo-1" } })
    const { result } = renderHook(() => useTodoLabelSelection())

    act(() => result.current.selectLabel(null))

    expect(mocks.applyLabel).toHaveBeenCalledWith("todo-1", null)
  })
})
