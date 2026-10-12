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
    <DeleteLabelDialog labelName="Work" onConfirm={onConfirm} {...props}>
      <Button>Open</Button>
    </DeleteLabelDialog>
  )
  return { onConfirm, user: userEvent.setup() }
}

describe("DeleteLabelDialog", () => {
  it("warns about unassigning and confirms deletion", async () => {
    const { onConfirm, user } = renderDialog()

    await user.click(screen.getByRole("button", { name: "Open" }))

    expect(
      await screen.findByText(/removes the label from every todo/i)
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Delete label" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
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
})
