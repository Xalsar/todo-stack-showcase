import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { useLabelManager } from "./label-manager"
import { LabelManagerTrigger } from "./label-manager-trigger"

beforeEach(() => {
  useLabelManager.setState({ open: false, selectedTodo: null })
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
})
