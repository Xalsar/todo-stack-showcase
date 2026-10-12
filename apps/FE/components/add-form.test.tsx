import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AddForm } from "./add-form"

function renderForm(props: Partial<React.ComponentProps<typeof AddForm>> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(true)
  render(
    <AddForm
      label="New todo"
      placeholder="Add a todo…"
      submitLabel="Add todo"
      requiredMessage="Title is required"
      failureMessage="Failed to create todo. Is the backend running?"
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

describe("AddForm", () => {
  it("submits the trimmed value and resets the input on success", async () => {
    const { onSubmit, user } = renderForm()

    await user.type(getInput(), "  Buy milk  ")
    await user.click(getSubmitButton())

    expect(onSubmit).toHaveBeenCalledWith("Buy milk")
    expect(getInput()).toHaveValue("")
  })

  it("requires a value and does not submit when empty", async () => {
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

  it("maps a submit error to a field error when mapError returns a message", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("conflict"))
    const mapError = vi.fn().mockReturnValue("Already exists")
    const user = userEvent.setup()
    render(
      <AddForm
        label="New label"
        placeholder="Add a label…"
        submitLabel="Add label"
        requiredMessage="Name is required"
        failureMessage="Failed to save label. Is the backend running?"
        onSubmit={onSubmit}
        isSubmitting={false}
        failed={false}
        mapError={mapError}
      />
    )

    await user.type(screen.getByLabelText("New label"), "Work")
    await user.click(screen.getByRole("button", { name: "Add label" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Already exists")
    expect(mapError).toHaveBeenCalled()
  })

  it("swallows submit errors when mapError returns no message", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"))
    const user = userEvent.setup()
    render(
      <AddForm
        label="New label"
        placeholder="Add a label…"
        submitLabel="Add label"
        requiredMessage="Name is required"
        failureMessage="Failed to save label. Is the backend running?"
        onSubmit={onSubmit}
        isSubmitting={false}
        failed={false}
      />
    )

    await user.type(screen.getByLabelText("New label"), "Work")
    await user.click(screen.getByRole("button", { name: "Add label" }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
})
