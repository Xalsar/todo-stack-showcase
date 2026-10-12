import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Label } from "@/src/lib/api/generated/model"

type LabelsState = {
  data?: Label[]
  error?: unknown
  isLoading?: boolean
  mutate: ReturnType<typeof vi.fn>
}

const labels = vi.hoisted(() => ({
  value: {} as LabelsState,
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

import {
  LabelManagerContext,
  type LabelManagerContextValue,
} from "../hooks/use-label-manager"
import { LabelManager } from "./label-manager"

const work: Label = {
  id: "1",
  name: "Work",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}
const home: Label = {
  id: "2",
  name: "Home",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

function contextValue(
  overrides: Partial<LabelManagerContextValue> = {}
): LabelManagerContextValue {
  return {
    open: true,
    onOpenChange: vi.fn(),
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    ...overrides,
  }
}

function renderManager(value = contextValue()) {
  render(
    <LabelManagerContext.Provider value={value}>
      <LabelManager />
    </LabelManagerContext.Provider>
  )
  return value
}

beforeEach(() => {
  vi.clearAllMocks()
  labels.value = {
    data: [work, home],
    error: undefined,
    isLoading: false,
    mutate: client.mutate,
  }
})

describe("LabelManager", () => {
  it("shows a skeleton while labels load", () => {
    labels.value = {
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: client.mutate,
    }

    renderManager()

    expect(document.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
  })

  it("lists labels when loaded", async () => {
    renderManager()

    expect(await screen.findByText("Work")).toBeInTheDocument()
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add label" })
    ).toBeInTheDocument()
  })

  it("shows an empty state when there are no labels", async () => {
    labels.value = {
      data: [],
      error: undefined,
      isLoading: false,
      mutate: client.mutate,
    }

    renderManager()

    expect(await screen.findByText("No labels yet")).toBeInTheDocument()
  })

  it("shows an error state when loading fails", async () => {
    labels.value = {
      data: undefined,
      error: new Error("boom"),
      isLoading: false,
      mutate: client.mutate,
    }

    renderManager()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load labels"
    )
  })
})
