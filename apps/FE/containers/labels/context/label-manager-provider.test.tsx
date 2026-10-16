import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import type { Label } from "@/src/lib/api/generated/model"

const labels = vi.hoisted(() => ({
  value: {} as {
    data?: Label[]
    error?: unknown
    isLoading?: boolean
    mutate: ReturnType<typeof vi.fn>
  },
}))

const client = vi.hoisted(() => ({
  mutate: vi.fn(),
  postLabels: vi.fn(),
  patchLabelsId: vi.fn(),
  deleteLabelsId: vi.fn(),
  todosMutate: vi.fn(),
}))

vi.mock("@/src/lib/api/generated/client", () => ({
  useGetLabels: () => labels.value,
  useGetTodos: () => ({ data: [], mutate: client.todosMutate }),
  postLabels: client.postLabels,
  patchLabelsId: client.patchLabelsId,
  deleteLabelsId: client.deleteLabelsId,
}))

import { LabelManagerProvider } from "./label-manager-provider"
import { LabelManagerTrigger } from "./label-manager-trigger"
import { useLabelManager } from "./label-manager"

const work: Label = {
  id: "1",
  name: "Work",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

function Probe() {
  const { open, openLabelManager, closeLabelManager } = useLabelManager()

  return (
    <>
      <span data-testid="state">{open ? "open" : "closed"}</span>
      <Button onClick={() => openLabelManager()}>Open via context</Button>
      <Button onClick={closeLabelManager}>Close via context</Button>
    </>
  )
}

function renderProvider(children: React.ReactNode) {
  render(<LabelManagerProvider>{children}</LabelManagerProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  labels.value = {
    data: [work],
    error: undefined,
    isLoading: false,
    mutate: client.mutate,
  }
})

describe("LabelManagerProvider", () => {
  it("opens and closes the dialog through the trigger", async () => {
    const user = userEvent.setup()
    renderProvider(
      <>
        <LabelManagerTrigger />
        <Probe />
      </>
    )

    expect(screen.getByTestId("state")).toHaveTextContent("closed")

    await user.click(screen.getByRole("button", { name: "Labels" }))

    expect(
      await screen.findByRole("heading", { name: "Manage labels" })
    ).toBeInTheDocument()
    expect(screen.getByTestId("state")).toHaveTextContent("open")

    await user.click(
      screen.getByRole("button", { name: "Close via context", hidden: true })
    )

    expect(screen.getByTestId("state")).toHaveTextContent("closed")
  })

  it("closes through the dialog close button", async () => {
    const user = userEvent.setup()
    renderProvider(<Probe />)

    await user.click(screen.getByRole("button", { name: "Open via context" }))
    expect(
      await screen.findByRole("heading", { name: "Manage labels" })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Close" }))

    expect(screen.getByTestId("state")).toHaveTextContent("closed")
  })
})
