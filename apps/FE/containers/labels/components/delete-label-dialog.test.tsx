import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DeleteLabelDialog } from "./delete-label-dialog"

type Props = React.ComponentProps<typeof DeleteLabelDialog>

function renderDialog(props: Partial<Props> = {}) {
  const onConfirm = vi.fn()
  const onClose = vi.fn()
  const onClosed = vi.fn()
  const baseProps: Props = {
    open: true,
    labelName: "Work",
    affectedTodos: 0,
    onConfirm,
    onClose,
    onClosed,
    ...props,
  }
  const { rerender } = render(<DeleteLabelDialog {...baseProps} />)
  return {
    onConfirm,
    onClose,
    onClosed,
    rerender: (next: Partial<Props>) =>
      rerender(<DeleteLabelDialog {...baseProps} {...next} />),
    user: userEvent.setup(),
  }
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

    expect(
      await screen.findByText(/permanently deletes the label/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/delete “work”\?/i)).toBeInTheDocument()
    expect(screen.getByText(/applied to 3 todos/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Delete label" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("shows an info notice when no todos use the label", async () => {
    renderDialog({ affectedTodos: 0 })

    expect(
      await screen.findByText(/no todos use this label/i)
    ).toBeInTheDocument()
  })

  it("omits the usage notice when the count is unknown", async () => {
    renderDialog({ affectedTodos: undefined })

    expect(
      await screen.findByText(/permanently deletes the label/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/no todos use this label/i)).toBeNull()
    expect(screen.queryByText(/applied to/i)).toBeNull()
  })

  it("uses singular copy when one todo uses the label", async () => {
    renderDialog({ affectedTodos: 1 })

    expect(await screen.findByText(/applied to 1 todo\b/i)).toBeInTheDocument()
  })

  it("renders nothing while closed", () => {
    renderDialog({ open: false })

    expect(screen.queryByText(/permanently deletes the label/i)).toBeNull()
  })

  it("requests closing without deleting on cancel", async () => {
    const { onConfirm, onClose, user } = renderDialog()

    await user.click(await screen.findByRole("button", { name: "Cancel" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("requests closing on Escape", async () => {
    const { onClose, user } = renderDialog()
    await screen.findByText(/permanently deletes the label/i)

    await user.keyboard("{Escape}")

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("reports when it has finished closing", async () => {
    const { onClosed, rerender } = renderDialog()
    await screen.findByText(/permanently deletes the label/i)

    rerender({ open: false })

    await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1))
  })

  it.each([
    ["confirmed", "Delete label"],
    ["cancelled", "Cancel"],
  ])("keeps the count steady while closing when %s", async (_, buttonName) => {
    const { rerender, user } = renderDialog({ affectedTodos: 3 })

    const button = await screen.findByRole("button", { name: buttonName })
    holdCloseAnimation()
    await user.click(button)
    rerender({ open: false, affectedTodos: 0 })

    expect(screen.getByText(/applied to 3 todos/i)).toBeInTheDocument()
    expect(screen.queryByText(/no todos use this label/i)).toBeNull()
  })

  it("shows the live content while open", async () => {
    const { rerender } = renderDialog({ affectedTodos: 3 })
    expect(await screen.findByText(/applied to 3 todos/i)).toBeInTheDocument()

    rerender({ labelName: "Home", affectedTodos: 1 })

    expect(screen.getByText(/delete “home”\?/i)).toBeInTheDocument()
    expect(screen.getByText(/applied to 1 todo\b/i)).toBeInTheDocument()
  })

  it("shows the new label when reopened during the close animation", async () => {
    const { rerender, user } = renderDialog({ affectedTodos: 3 })

    const cancel = await screen.findByRole("button", { name: "Cancel" })
    holdCloseAnimation()
    await user.click(cancel)
    rerender({ open: false, affectedTodos: undefined })
    rerender({ open: true, labelName: "Home", affectedTodos: 1 })

    expect(screen.getByText(/delete “home”\?/i)).toBeInTheDocument()
    expect(screen.getByText(/applied to 1 todo\b/i)).toBeInTheDocument()
  })
})
