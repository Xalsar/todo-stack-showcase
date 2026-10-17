import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const authMock = vi.hoisted(() => ({ useSession: vi.fn() }))

vi.mock("@/src/lib/auth-client", () => ({
  authClient: { useSession: authMock.useSession },
}))

import { useLabelManager } from "./label-manager"
import { LabelManagerTrigger } from "./label-manager-trigger"

beforeEach(() => {
  useLabelManager.setState({ open: false, selectedTodo: null })
  authMock.useSession.mockReturnValue({
    data: { session: { id: "session-1" }, user: { id: "user-1" } },
    isPending: false,
  })
})

describe("LabelManagerTrigger", () => {
  it("opens the label manager without a target todo when clicked", async () => {
    const user = userEvent.setup()
    render(<LabelManagerTrigger />)

    await user.click(screen.getByRole("button", { name: "Labels" }))

    const { open, selectedTodo } = useLabelManager.getState()

    expect(open).toBe(true)
    expect(selectedTodo).toBeNull()
  })

  it("renders nothing when the user is not signed in", () => {
    authMock.useSession.mockReturnValue({ data: null, isPending: false })

    const { container } = render(<LabelManagerTrigger />)

    expect(container).toBeEmptyDOMElement()
  })
})
