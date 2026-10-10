import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { EditTodoForm } from "./edit-todo-form"

function renderForm(
  props: Partial<React.ComponentProps<typeof EditTodoForm>> = {}
) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  render(
    <EditTodoForm
      initialTitle="Write tests"
      isSubmitting={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />
  )
  return { onSubmit, onCancel, user: userEvent.setup() }
}

function getInput() {
  return screen.getByLabelText<HTMLInputElement>("Edit todo title")
}

describe("EditTodoForm", () => {
  it("renders the initial title, focused and selected", () => {
    renderForm()

    const input = getInput()
    expect(input).toHaveValue("Write tests")
    expect(input).toHaveFocus()
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe("Write tests".length)
  })

  it("submits the edited title", async () => {
    const { onSubmit, user } = renderForm()

    await user.clear(getInput())
    await user.type(getInput(), "Renamed")
    await user.click(screen.getByRole("button", { name: "Save todo" }))

    expect(onSubmit).toHaveBeenCalledWith("Renamed")
  })

  it("shows a validation error for an empty title and does not submit", async () => {
    const { onSubmit, user } = renderForm()

    await user.clear(getInput())
    await user.click(screen.getByRole("button", { name: "Save todo" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Title is required"
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("cancels when the cancel button is clicked", async () => {
    const { onCancel, user } = renderForm()

    await user.click(screen.getByRole("button", { name: "Cancel editing" }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("cancels when focus leaves the form", () => {
    const { onCancel } = renderForm()

    fireEvent.blur(getInput(), { relatedTarget: document.body })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("does not cancel when focus moves within the form", async () => {
    const { onCancel, user } = renderForm()

    await user.click(screen.getByRole("button", { name: "Save todo" }))

    expect(onCancel).not.toHaveBeenCalled()
  })

  it("disables the controls while submitting", () => {
    renderForm({ isSubmitting: true })

    expect(getInput()).toBeDisabled()
    expect(screen.getByRole("button", { name: "Save todo" })).toBeDisabled()
    expect(
      screen.getByRole("button", { name: "Cancel editing" })
    ).toBeDisabled()
  })
})
