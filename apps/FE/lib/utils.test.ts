import { describe, expect, it } from "vitest"

import { cn } from "./utils"

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1")
  })

  it("ignores falsy values", () => {
    expect(cn("px-2", false, null, undefined, "", "py-1")).toBe("px-2 py-1")
  })

  it("supports conditional objects", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active")
  })

  it("resolves conflicting tailwind utilities, keeping the last", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("returns an empty string with no input", () => {
    expect(cn()).toBe("")
  })
})
