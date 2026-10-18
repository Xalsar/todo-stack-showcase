import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

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

// jsdom has no Web Animations API, so Base UI unmounts a closing dialog at once.
// A never-finishing animation holds it in its closing phase.
function holdCloseAnimation() {
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    value: () => [{ finished: new Promise(() => {}) }],
  })
}

describe("DeleteLabelDialog", () => {
  afterEach(() => {
    Reflect.deleteProperty(Element.prototype, "getAnimations")
  })

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

  it("omits the usage notice when the count is unknown", async () => {
    const { user } = renderDialog({ affectedTodos: undefined })

    await user.click(screen.getByRole("button", { name: "Open" }))

    expect(
      await screen.findByText(/permanently deletes the label/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/no todos use this label/i)).toBeNull()
    expect(screen.queryByText(/applied to/i)).toBeNull()
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

  it.each([
    ["confirmed", "Delete label"],
    ["cancelled", "Cancel"],
  ])(
    "keeps the affected count steady while closing when %s",
    async (_, buttonName) => {
      const user = userEvent.setup()
      const { rerender } = render(
        <DeleteLabelDialog
          labelName="Work"
          affectedTodos={3}
          onConfirm={vi.fn()}
          open
        />
      )

      const button = await screen.findByRole("button", { name: buttonName })
      holdCloseAnimation()
      await user.click(button)
      rerender(
        <DeleteLabelDialog
          labelName="Work"
          affectedTodos={0}
          onConfirm={vi.fn()}
          open={false}
        />
      )

      expect(screen.getByText(/applied to 3 todos/i)).toBeInTheDocument()
      expect(screen.queryByText(/no todos use this label/i)).toBeNull()
    }
  )

  it("shows the live count while open", async () => {
    const props = { labelName: "Work", onConfirm: vi.fn(), open: true }
    const { rerender } = render(
      <DeleteLabelDialog {...props} affectedTodos={3} />
    )
    expect(await screen.findByText(/applied to 3 todos/i)).toBeInTheDocument()

    rerender(<DeleteLabelDialog {...props} affectedTodos={1} />)

    expect(screen.getByText(/applied to 1 todo\b/i)).toBeInTheDocument()
  })
})
