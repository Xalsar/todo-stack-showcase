import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const authMock = vi.hoisted(() => ({
  useSession: vi.fn(),
  signInSocial: vi.fn(),
}))

vi.mock("@/src/lib/auth-client", () => ({
  authClient: {
    useSession: authMock.useSession,
    signIn: { social: authMock.signInSocial },
  },
}))

import { AuthGate } from "./auth-gate"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("AuthGate", () => {
  it("shows a spinner while the session is pending", () => {
    authMock.useSession.mockReturnValue({ data: undefined, isPending: true })

    render(
      <AuthGate>
        <p>Secret</p>
      </AuthGate>
    )

    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.queryByText("Secret")).not.toBeInTheDocument()
  })

  it("renders children when authenticated", () => {
    authMock.useSession.mockReturnValue({
      data: { session: {} },
      isPending: false,
    })

    render(
      <AuthGate>
        <p>Secret</p>
      </AuthGate>
    )

    expect(screen.getByText("Secret")).toBeInTheDocument()
  })

  it("shows the sign-in prompt when unauthenticated", () => {
    authMock.useSession.mockReturnValue({ data: null, isPending: false })

    render(
      <AuthGate>
        <p>Secret</p>
      </AuthGate>
    )

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeInTheDocument()
  })

  it("starts the Google sign-in flow", async () => {
    authMock.useSession.mockReturnValue({ data: null, isPending: false })
    const user = userEvent.setup()

    render(
      <AuthGate>
        <p>Secret</p>
      </AuthGate>
    )
    await user.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    expect(authMock.signInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: window.location.href,
    })
  })
})
