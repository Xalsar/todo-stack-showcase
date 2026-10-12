import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LabelNameConflictError } from "../label-errors"
import type { Label } from "@/src/lib/api/generated/model"

import { LabelRow } from "./label-row"

const work: Label = {
  id: "1",
  name: "Work",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

function renderRow(
  overrides: Partial<React.ComponentProps<typeof LabelRow>> = {}
) {
  const handlers = {
    onRename: vi.fn().mockResolvedValue(true),
    onDelete: vi.fn().mockResolvedValue(undefined),
  }
  render(
    <LabelRow
      label={work}
      isRenaming={false}
      isDeleting={false}
      {...handlers}
      {...overrides}
    />
  )
  return { ...handlers, user: userEvent.setup() }
}

describe("LabelRow", () => {
  it("renders the label name", () => {
    renderRow()

    expect(screen.getByText("Work")).toBeInTheDocument()
  })

  it("starts renaming when the label name is clicked", async () => {
    const { user } = renderRow()

    await user.click(screen.getByText("Work"))

    expect(screen.getByLabelText("Edit label name")).toBeInTheDocument()
  })

  it("starts renaming when Enter is pressed on the label name", () => {
    renderRow()

    fireEvent.keyDown(screen.getByText("Work"), { key: "Enter" })

    expect(screen.getByLabelText("Edit label name")).toBeInTheDocument()
  })

  it("starts renaming when Space is pressed on the label name", () => {
    renderRow()

    fireEvent.keyDown(screen.getByText("Work"), { key: " " })

    expect(screen.getByLabelText("Edit label name")).toBeInTheDocument()
  })

  it("does not start renaming while deleting", async () => {
    const { user } = renderRow({ isDeleting: true })

    await user.click(screen.getByText("Work"))

    expect(screen.queryByLabelText("Edit label name")).not.toBeInTheDocument()
  })

  it("does not start renaming from the keyboard while deleting", () => {
    renderRow({ isDeleting: true })

    fireEvent.keyDown(screen.getByText("Work"), { key: "Enter" })

    expect(screen.queryByLabelText("Edit label name")).not.toBeInTheDocument()
  })

  it("renames inline and exits edit mode on success", async () => {
    const { onRename, user } = renderRow()

    await user.click(screen.getByRole("button", { name: "Rename Work" }))
    const input = screen.getByLabelText("Edit label name")
    expect(input).toHaveValue("Work")

    await user.clear(input)
    await user.type(input, "Office")
    await user.click(screen.getByRole("button", { name: "Save label" }))

    expect(onRename).toHaveBeenCalledWith("1", "Office")
    expect(await screen.findByText("Work")).toBeInTheDocument()
  })

  it("cancels an inline rename", async () => {
    const { user } = renderRow()

    await user.click(screen.getByRole("button", { name: "Rename Work" }))
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(screen.queryByLabelText("Edit label name")).not.toBeInTheDocument()
  })

  it("keeps editing when the rename conflicts", async () => {
    const onRename = vi
      .fn()
      .mockRejectedValue(new LabelNameConflictError("Home"))
    const user = userEvent.setup()
    render(
      <LabelRow
        label={work}
        isRenaming={false}
        isDeleting={false}
        onRename={onRename}
        onDelete={vi.fn()}
      />
    )

    await user.click(screen.getByRole("button", { name: "Rename Work" }))
    await user.click(screen.getByRole("button", { name: "Save label" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A label with this name already exists"
    )
    expect(screen.getByLabelText("Edit label name")).toBeInTheDocument()
  })

  it("confirms deletion through the alert dialog", async () => {
    const { onDelete, user } = renderRow()

    await user.click(screen.getByRole("button", { name: "Delete Work" }))
    expect(
      await screen.findByText(/removes the label from every todo/i)
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Delete label" }))
    expect(onDelete).toHaveBeenCalledWith("1")
  })

  it("disables the controls while deleting", () => {
    renderRow({ isDeleting: true })

    expect(screen.getByRole("button", { name: "Rename Work" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Delete Work" })).toBeDisabled()
  })
})
