import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const authMock = vi.hoisted(() => ({ useSession: vi.fn() }))
const signOutMock = vi.hoisted(() => ({
  onSignOut: vi.fn(),
  isSigningOut: false,
}))

vi.mock("@/src/lib/auth-client", () => ({
  authClient: { useSession: authMock.useSession },
}))
vi.mock("@/containers/auth/hooks/use-sign-out", () => ({
  useSignOut: () => signOutMock,
}))

import { UserMenu } from "./user-menu"

beforeEach(() => {
  vi.clearAllMocks()
  signOutMock.isSigningOut = false
})

describe("UserMenu", () => {
  it("renders nothing when there is no user", () => {
    authMock.useSession.mockReturnValue({ data: null })

    const { container } = render(<UserMenu />)

    expect(container).toBeEmptyDOMElement()
  })

  it("shows the initial and opens the menu with the email", async () => {
    authMock.useSession.mockReturnValue({
      data: { user: { name: "Alice", email: "alice@example.com" } },
    })
    const user = userEvent.setup()

    render(<UserMenu />)

    expect(screen.getByText("A")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Open user menu" }))
    expect(await screen.findByText("alice@example.com")).toBeInTheDocument()
  })

  it("falls back to the email initial when the name is missing", () => {
    authMock.useSession.mockReturnValue({
      data: { user: { name: null, email: "bob@example.com" } },
    })

    render(<UserMenu />)

    expect(screen.getByText("B")).toBeInTheDocument()
  })

  it("shows a placeholder when the email is missing", async () => {
    authMock.useSession.mockReturnValue({
      data: { user: { name: "Alice", email: undefined } },
    })
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole("button", { name: "Open user menu" }))

    expect(await screen.findByText("…")).toBeInTheDocument()
  })

  it("signs out from the menu", async () => {
    authMock.useSession.mockReturnValue({
      data: { user: { name: "Alice", email: "alice@example.com" } },
    })
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole("button", { name: "Open user menu" }))
    await user.click(await screen.findByRole("menuitem", { name: /sign out/i }))

    expect(signOutMock.onSignOut).toHaveBeenCalledTimes(1)
  })

  it("disables sign out while signing out", async () => {
    authMock.useSession.mockReturnValue({
      data: { user: { name: "Alice", email: "alice@example.com" } },
    })
    signOutMock.isSigningOut = true
    const user = userEvent.setup()

    render(<UserMenu />)
    await user.click(screen.getByRole("button", { name: "Open user menu" }))

    expect(
      await screen.findByRole("menuitem", { name: /sign out/i })
    ).toHaveAttribute("aria-disabled", "true")
  })
})
