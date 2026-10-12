import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LabelNameConflictError } from "../label-errors"

import { LabelForm } from "./label-form"

function renderForm(
  props: Partial<React.ComponentProps<typeof LabelForm>> = {}
) {
  const onSubmit = vi.fn().mockResolvedValue(true)
  render(<LabelForm onSubmit={onSubmit} {...props} />)
  return { onSubmit, user: userEvent.setup() }
}

describe("LabelForm", () => {
  it("submits the trimmed name and resets on success", async () => {
    const { onSubmit, user } = renderForm()

    const input = screen.getByLabelText("New label")
    await user.type(input, "  Errands  ")
    await user.click(screen.getByRole("button", { name: "Add label" }))

    expect(onSubmit).toHaveBeenCalledWith("Errands")
    expect(input).toHaveValue("")
  })

  it("requires a name", async () => {
    const { onSubmit, user } = renderForm()

    await user.click(screen.getByRole("button", { name: "Add label" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Name is required"
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("shows a field error on a name conflict", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new LabelNameConflictError("Work"))
    const user = userEvent.setup()
    render(<LabelForm onSubmit={onSubmit} />)

    const input = screen.getByLabelText("New label")
    await user.type(input, "Work")
    await user.click(screen.getByRole("button", { name: "Add label" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A label with this name already exists"
    )
    expect(input).toHaveValue("Work")
  })

  it("shows a generic field error on other failures", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"))
    const user = userEvent.setup()
    render(<LabelForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("New label"), "Work")
    await user.click(screen.getByRole("button", { name: "Add label" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to save label"
    )
  })

  it("shows the failure alert when failed is true", () => {
    renderForm({ failed: true })

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to save label. Is the backend running?"
    )
  })

  it("disables the controls while submitting", () => {
    renderForm({ isSubmitting: true })

    expect(screen.getByLabelText("New label")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Add label" })).toBeDisabled()
  })
})
