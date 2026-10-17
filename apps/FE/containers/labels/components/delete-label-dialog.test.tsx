import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"

import { DeleteLabelDialog } from "./delete-label-dialog"

function renderDialog(
  props: Partial<React.ComponentProps<typeof DeleteLabelDialog>> = {}
) {
  const onConfirm = vi.fn()
  render(
    <DeleteLabelDialog
      labelName="Work"
      affectedTodos={0}
      onConfirm={onConfirm}
      {...props}
    >
      <Button>Open</Button>
    </DeleteLabelDialog>
  )
  return { onConfirm, user: userEvent.setup() }
}

function renderControlledDialog(
  props: Partial<React.ComponentProps<typeof DeleteLabelDialog>> = {}
) {
  const onConfirm = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <DeleteLabelDialog
      labelName="Work"
      affectedTodos={0}
      onConfirm={onConfirm}
      open
      onOpenChange={onOpenChange}
      {...props}
    />
  )
  return { onConfirm, onOpenChange, user: userEvent.setup() }
}

describe("DeleteLabelDialog", () => {
  it("warns about unassigning and confirms deletion", async () => {
    const { onConfirm, user } = renderDialog({ affectedTodos: 3 })

    await user.click(screen.getByRole("button", { name: "Open" }))

    expect(
      await screen.findByText(/permanently deletes the label/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/applied to 3 todos/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Delete label" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("shows an info notice when no todos use the label", async () => {
    const { user } = renderDialog({ affectedTodos: 0 })

    await user.click(screen.getByRole("button", { name: "Open" }))

    expect(
      await screen.findByText(/no todos use this label/i)
    ).toBeInTheDocument()
  })

  it("uses singular copy when one todo uses the label", async () => {
    const { user } = renderDialog({ affectedTodos: 1 })

    await user.click(screen.getByRole("button", { name: "Open" }))

    expect(await screen.findByText(/applied to 1 todo\b/i)).toBeInTheDocument()
  })

  it("closes without deleting on cancel", async () => {
    const { onConfirm, user } = renderDialog()

    await user.click(screen.getByRole("button", { name: "Open" }))
    await user.click(await screen.findByRole("button", { name: "Cancel" }))

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("shows a pending state while deleting", async () => {
    const { user } = renderDialog({ isDeleting: true })

    await user.click(screen.getByRole("button", { name: "Open" }))

    expect(
      await screen.findByRole("button", { name: "Delete label" })
    ).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
  })

  it("opens immediately when controlled with open prop", async () => {
    renderControlledDialog()

    expect(
      await screen.findByText(/permanently deletes the label/i)
    ).toBeInTheDocument()
  })

  it("calls onOpenChange when cancel is clicked in controlled mode", async () => {
    const { onOpenChange, user } = renderControlledDialog()

    await user.click(await screen.findByRole("button", { name: "Cancel" }))

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it("confirms deletion in controlled mode", async () => {
    const { onConfirm, user } = renderControlledDialog()

    await user.click(
      await screen.findByRole("button", { name: "Delete label" })
    )

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
