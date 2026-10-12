import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { InlineEditForm } from "./inline-edit-form"

function renderForm(
  props: Partial<React.ComponentProps<typeof InlineEditForm>> = {}
) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  render(
    <InlineEditForm
      defaultValue="Write tests"
      inputLabel="Edit todo title"
      saveLabel="Save todo"
      cancelLabel="Cancel editing"
      requiredMessage="Title is required"
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

describe("InlineEditForm", () => {
  it("renders the initial value, focused and selected", () => {
    renderForm()

    const input = getInput()
    expect(input).toHaveValue("Write tests")
    expect(input).toHaveFocus()
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe("Write tests".length)
  })

  it("submits the edited value", async () => {
    const { onSubmit, user } = renderForm()

    await user.clear(getInput())
    await user.type(getInput(), "Renamed")
    await user.click(screen.getByRole("button", { name: "Save todo" }))

    expect(onSubmit).toHaveBeenCalledWith("Renamed")
  })

  it("shows a validation error for an empty value and does not submit", async () => {
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

  it("maps a submit error to a field error when mapError returns a message", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("conflict"))
    const mapError = vi.fn().mockReturnValue("Already exists")
    const user = userEvent.setup()
    render(
      <InlineEditForm
        defaultValue="Work"
        inputLabel="Edit label name"
        saveLabel="Save label"
        cancelLabel="Cancel"
        requiredMessage="Name is required"
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        mapError={mapError}
      />
    )

    await user.click(screen.getByRole("button", { name: "Save label" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Already exists")
    expect(mapError).toHaveBeenCalled()
  })

  it("swallows submit errors when mapError returns no message", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"))
    const user = userEvent.setup()
    render(
      <InlineEditForm
        defaultValue="Work"
        inputLabel="Edit label name"
        saveLabel="Save label"
        cancelLabel="Cancel"
        requiredMessage="Name is required"
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "Save label" }))

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
})
