import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const themeMock = vi.hoisted(() => ({
  resolvedTheme: "light",
  setTheme: vi.fn(),
}))

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: unknown }) => children,
  useTheme: () => themeMock,
}))

import { ThemeProvider } from "./theme-provider"

beforeEach(() => {
  vi.clearAllMocks()
  themeMock.resolvedTheme = "light"
})

describe("ThemeProvider", () => {
  it("renders its children", () => {
    render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>
    )

    expect(screen.getByText("Child")).toBeInTheDocument()
  })

  it("toggles the theme when 'd' is pressed", () => {
    render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>
    )

    fireEvent.keyDown(window, { key: "d" })

    expect(themeMock.setTheme).toHaveBeenCalledWith("dark")
  })

  it("toggles back to light when the theme is dark", () => {
    themeMock.resolvedTheme = "dark"
    render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>
    )

    fireEvent.keyDown(window, { key: "D" })

    expect(themeMock.setTheme).toHaveBeenCalledWith("light")
  })

  it("ignores the hotkey when a modifier is pressed", () => {
    render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>
    )

    fireEvent.keyDown(window, { key: "d", metaKey: true })
    fireEvent.keyDown(window, { key: "d", ctrlKey: true })
    fireEvent.keyDown(window, { key: "d", altKey: true })

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("ignores repeated keydown events", () => {
    render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>
    )

    fireEvent.keyDown(window, { key: "d", repeat: true })

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("ignores other keys", () => {
    render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>
    )

    fireEvent.keyDown(window, { key: "a" })

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("ignores default-prevented events", () => {
    render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>
    )

    const event = new KeyboardEvent("keydown", { key: "d", cancelable: true })
    event.preventDefault()
    window.dispatchEvent(event)

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("ignores the hotkey while typing in an input", () => {
    render(
      <ThemeProvider>
        <input aria-label="field" />
      </ThemeProvider>
    )

    fireEvent.keyDown(screen.getByLabelText("field"), { key: "d" })

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("ignores the hotkey in a textarea", () => {
    render(
      <ThemeProvider>
        <textarea aria-label="notes" />
      </ThemeProvider>
    )

    fireEvent.keyDown(screen.getByLabelText("notes"), { key: "d" })

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("ignores the hotkey in a select", () => {
    render(
      <ThemeProvider>
        <select aria-label="choice" />
      </ThemeProvider>
    )

    fireEvent.keyDown(screen.getByLabelText("choice"), { key: "d" })

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("ignores the hotkey in a content-editable target", () => {
    render(
      <ThemeProvider>
        <div contentEditable aria-label="editor" />
      </ThemeProvider>
    )

    const editor = screen.getByLabelText("editor")
    Object.defineProperty(editor, "isContentEditable", { value: true })
    fireEvent.keyDown(editor, { key: "d" })

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })

  it("stops listening after unmount", () => {
    const { unmount } = render(
      <ThemeProvider>
        <p>Child</p>
      </ThemeProvider>
    )

    unmount()
    fireEvent.keyDown(window, { key: "d" })

    expect(themeMock.setTheme).not.toHaveBeenCalled()
  })
})
