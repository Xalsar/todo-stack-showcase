import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const authMock = vi.hoisted(() => ({ signOut: vi.fn() }))

vi.mock("@/src/lib/auth-client", () => ({
  authClient: { signOut: authMock.signOut },
}))

import { useSignOut } from "./use-sign-out"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("useSignOut", () => {
  it("signs out and resets the flag", async () => {
    authMock.signOut.mockResolvedValue(undefined)
    const { result } = renderHook(() => useSignOut())

    await act(async () => {
      await result.current.onSignOut()
    })

    expect(authMock.signOut).toHaveBeenCalledTimes(1)
    expect(result.current.isSigningOut).toBe(false)
  })

  it("resets the flag when sign out fails", async () => {
    authMock.signOut.mockRejectedValue(new Error("boom"))
    const { result } = renderHook(() => useSignOut())

    await act(async () => {
      await expect(result.current.onSignOut()).rejects.toThrow("boom")
    })

    expect(result.current.isSigningOut).toBe(false)
  })

  it("exposes isSigningOut while in flight", async () => {
    let resolveSignOut: () => void = () => {}
    authMock.signOut.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSignOut = resolve
      })
    )
    const { result } = renderHook(() => useSignOut())

    let pending: Promise<void> | undefined
    act(() => {
      pending = result.current.onSignOut()
    })
    expect(result.current.isSigningOut).toBe(true)

    await act(async () => {
      resolveSignOut()
      await pending
    })
    expect(result.current.isSigningOut).toBe(false)
  })
})
