import { beforeEach, describe, expect, it } from "vitest"

import { useLabelManager } from "./label-manager"

beforeEach(() => {
  useLabelManager.setState({ open: false, selectedTodo: null })
})

describe("useLabelManager", () => {
  it("starts closed without a selected todo", () => {
    const { open, selectedTodo } = useLabelManager.getState()

    expect(open).toBe(false)
    expect(selectedTodo).toBeNull()
  })

  it("opens the label manager without a target todo", () => {
    useLabelManager.getState().openLabelManager()

    const { open, selectedTodo } = useLabelManager.getState()

    expect(open).toBe(true)
    expect(selectedTodo).toBeNull()
  })

  it("opens the label manager with a target todo", () => {
    useLabelManager.getState().openLabelManager({ todoId: "todo-1" })

    const { open, selectedTodo } = useLabelManager.getState()

    expect(open).toBe(true)
    expect(selectedTodo).toEqual({ todoId: "todo-1" })
  })

  it("closes the label manager", () => {
    useLabelManager.setState({ open: true })

    useLabelManager.getState().closeLabelManager()

    expect(useLabelManager.getState().open).toBe(false)
  })

  it("toggles the open state through onOpenChange", () => {
    useLabelManager.getState().onOpenChange(true)
    expect(useLabelManager.getState().open).toBe(true)

    useLabelManager.getState().onOpenChange(false)
    expect(useLabelManager.getState().open).toBe(false)
  })
})
