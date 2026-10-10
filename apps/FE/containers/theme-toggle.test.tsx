import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const themeMock = vi.hoisted(() => ({
  resolvedTheme: "light",
  setTheme: vi.fn(),
}))

vi.mock("next-themes", () => ({ useTheme: () => themeMock }))

import { ThemeToggle } from "./theme-toggle"

beforeEach(() => {
  vi.clearAllMocks()
  themeMock.resolvedTheme = "light"
})

describe("ThemeToggle", () => {
  it("switches to dark when the theme is light", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button", { name: "Toggle theme" }))

    expect(themeMock.setTheme).toHaveBeenCalledWith("dark")
  })

  it("switches to light when the theme is dark", async () => {
    themeMock.resolvedTheme = "dark"
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button", { name: "Toggle theme" }))

    expect(themeMock.setTheme).toHaveBeenCalledWith("light")
  })
})
