import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  LabelManagerContext,
  useLabelManager,
  type LabelManagerContextValue,
} from "./label-manager"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("useLabelManager", () => {
  it("throws when used outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => renderHook(() => useLabelManager())).toThrow(
      "useLabelManager must be used within a LabelManagerProvider"
    )
  })

  it("returns the context value inside a provider", () => {
    const value: LabelManagerContextValue = {
      open: true,
      onOpenChange: vi.fn(),
      openLabelManager: vi.fn(),
      closeLabelManager: vi.fn(),
      selectedTodo: null,
    }

    const { result } = renderHook(() => useLabelManager(), {
      wrapper: ({ children }) => (
        <LabelManagerContext.Provider value={value}>
          {children}
        </LabelManagerContext.Provider>
      ),
    })

    expect(result.current).toBe(value)
  })
})
