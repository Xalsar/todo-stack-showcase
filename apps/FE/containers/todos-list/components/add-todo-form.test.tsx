import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AddTodoForm } from "./add-todo-form"

function renderForm(
  props: Partial<React.ComponentProps<typeof AddTodoForm>> = {}
) {
  const onSubmit = vi.fn().mockResolvedValue(true)
  render(
    <AddTodoForm
      onSubmit={onSubmit}
      isSubmitting={false}
      failed={false}
      {...props}
    />
  )
  return { onSubmit, user: userEvent.setup() }
}

function getInput() {
  return screen.getByLabelText("New todo")
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /add todo/i })
}

describe("AddTodoForm", () => {
  it("submits the trimmed title and resets the input on success", async () => {
    const { onSubmit, user } = renderForm()

    await user.type(getInput(), "  Buy milk  ")
    await user.click(getSubmitButton())

    expect(onSubmit).toHaveBeenCalledWith("Buy milk")
    expect(getInput()).toHaveValue("")
  })

  it("shows a validation error and does not submit when empty", async () => {
    const { onSubmit, user } = renderForm()

    await user.click(getSubmitButton())

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Title is required"
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("keeps the input value when the submission fails", async () => {
    const { user } = renderForm({ onSubmit: vi.fn().mockResolvedValue(false) })

    await user.type(getInput(), "Buy milk")
    await user.click(getSubmitButton())

    expect(getInput()).toHaveValue("Buy milk")
  })

  it("disables the input and button while submitting", () => {
    renderForm({ isSubmitting: true })

    expect(getInput()).toBeDisabled()
    expect(getSubmitButton()).toBeDisabled()
  })

  it("shows the failure alert when failed is true", () => {
    renderForm({ failed: true })

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to create todo. Is the backend running?"
    )
  })
})
