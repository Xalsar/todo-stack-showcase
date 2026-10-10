import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { Label, Todo } from "@/src/lib/api/generated/model"

import { TodoItem } from "./todo-item"

const todo: Todo = {
  id: "todo-1",
  title: "Write tests",
  done: false,
  labelId: null,
  userId: "user-1",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

const workLabel: Label = {
  id: "label-1",
  name: "Work",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

function renderItem(
  overrides: Partial<React.ComponentProps<typeof TodoItem>> = {}
) {
  const handlers = {
    onToggle: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onLabel: vi.fn().mockResolvedValue(undefined),
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onSubmitEdit: vi.fn().mockResolvedValue(undefined),
  }
  render(
    <TodoItem
      todo={todo}
      labels={[]}
      isMutating={false}
      editing={false}
      {...handlers}
      {...overrides}
    />
  )
  return { ...handlers, user: userEvent.setup() }
}

describe("TodoItem", () => {
  it("renders the title and the not-done state", () => {
    renderItem()

    expect(screen.getByText("Write tests")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Mark as done" })
    ).toHaveAttribute("aria-pressed", "false")
  })

  it("reflects the done state", () => {
    renderItem({ todo: { ...todo, done: true } })

    expect(
      screen.getByRole("button", { name: "Mark as not done" })
    ).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Write tests")).toHaveClass("line-through")
  })

  it("toggles the todo", async () => {
    const { onToggle, user } = renderItem()

    await user.click(screen.getByRole("button", { name: "Mark as done" }))

    expect(onToggle).toHaveBeenCalledWith("todo-1", true)
  })

  it("requests deletion", async () => {
    const { onDelete, user } = renderItem()

    await user.click(screen.getByRole("button", { name: "Delete todo" }))

    expect(onDelete).toHaveBeenCalledWith("todo-1")
  })

  it("starts editing from the edit button", async () => {
    const { onStartEdit, user } = renderItem()

    await user.click(screen.getByRole("button", { name: "Edit todo" }))

    expect(onStartEdit).toHaveBeenCalledTimes(1)
  })

  it("starts editing when the title is clicked", async () => {
    const { onStartEdit, user } = renderItem()

    await user.click(screen.getByText("Write tests"))

    expect(onStartEdit).toHaveBeenCalledTimes(1)
  })

  it("starts editing when Enter is pressed on the title", async () => {
    const { onStartEdit, user } = renderItem()

    const title = screen.getByText("Write tests")
    title.focus()
    await user.keyboard("{Enter}")

    expect(onStartEdit).toHaveBeenCalledTimes(1)
  })

  it("starts editing when Space is pressed on the title", () => {
    const { onStartEdit } = renderItem()

    fireEvent.keyDown(screen.getByText("Write tests"), { key: " " })

    expect(onStartEdit).toHaveBeenCalledTimes(1)
  })

  it("ignores other keys on the title", () => {
    const { onStartEdit } = renderItem()

    fireEvent.keyDown(screen.getByText("Write tests"), { key: "a" })

    expect(onStartEdit).not.toHaveBeenCalled()
  })

  it("renders the edit form while editing", async () => {
    const { onSubmitEdit, onCancelEdit, user } = renderItem({ editing: true })

    const input = screen.getByLabelText("Edit todo title")
    expect(input).toHaveValue("Write tests")

    await user.clear(input)
    await user.type(input, "Renamed")
    await user.click(screen.getByRole("button", { name: "Save todo" }))
    expect(onSubmitEdit).toHaveBeenCalledWith("Renamed")

    await user.click(screen.getByRole("button", { name: "Cancel editing" }))
    expect(onCancelEdit).toHaveBeenCalledTimes(1)
  })

  it("disables actions while mutating", () => {
    renderItem({ isMutating: true })

    expect(screen.getByRole("button", { name: "Mark as done" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Edit todo" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Delete todo" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "View labels" })).toBeDisabled()
  })

  it("assigns a label from the dropdown", async () => {
    const { onLabel, user } = renderItem({ labels: [workLabel] })

    await user.click(screen.getByRole("button", { name: "View labels" }))
    await user.click(await screen.findByRole("menuitem", { name: "Work" }))

    expect(onLabel).toHaveBeenCalledWith("todo-1", "label-1")
  })

  it("disables the 'No label' option when the todo has no label", async () => {
    const { user } = renderItem({ labels: [workLabel] })

    await user.click(screen.getByRole("button", { name: "View labels" }))

    expect(
      await screen.findByRole("menuitem", { name: "No label" })
    ).toHaveAttribute("aria-disabled", "true")
  })

  it("disables the currently applied label", async () => {
    const { user } = renderItem({
      labels: [workLabel],
      todo: { ...todo, labelId: workLabel.id },
    })

    await user.click(screen.getByRole("button", { name: "View labels" }))

    expect(
      await screen.findByRole("menuitem", { name: "Work" })
    ).toHaveAttribute("aria-disabled", "true")
  })

  it("clears the label from the dropdown", async () => {
    const { onLabel, user } = renderItem({
      labels: [workLabel],
      todo: { ...todo, labelId: workLabel.id },
    })

    await user.click(screen.getByRole("button", { name: "View labels" }))
    await user.click(await screen.findByRole("menuitem", { name: "No label" }))

    expect(onLabel).toHaveBeenCalledWith("todo-1", null)
  })

  it("shows a disabled placeholder when there are no labels", async () => {
    const { user } = renderItem({ labels: [] })

    await user.click(screen.getByRole("button", { name: "View labels" }))

    expect(
      await screen.findByRole("menuitem", { name: "No labels" })
    ).toHaveAttribute("aria-disabled", "true")
  })
})
