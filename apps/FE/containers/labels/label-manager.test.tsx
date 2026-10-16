import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
  patchTodosIdLabel: vi.fn(),
}))

const todos = vi.hoisted(() => ({
  value: {
    data: [] as Array<{ id: string; labelId: string | null }>,
    mutate: client.todosMutate,
  },
}))

vi.mock("@/src/lib/api/generated/client", () => ({
  useGetLabels: () => labels.value,
  useGetTodos: () => todos.value,
  postLabels: client.postLabels,
  patchLabelsId: client.patchLabelsId,
  deleteLabelsId: client.deleteLabelsId,
  patchTodosIdLabel: client.patchTodosIdLabel,
}))

import {
  LabelManagerContext,
  type LabelManagerContextValue,
} from "./context/label-manager"
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
    openLabelManager: vi.fn(),
    closeLabelManager: vi.fn(),
    selectedTodo: null,
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
  todos.value = {
    data: [],
    mutate: client.todosMutate,
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

  it("preselects the current todo label when opened with a target", async () => {
    todos.value = {
      data: [{ id: "todo-1", labelId: work.id }],
      mutate: client.todosMutate,
    }

    renderManager(contextValue({ selectedTodo: { todoId: "todo-1" } }))

    expect(await screen.findByRole("radio", { name: "Work" })).toBeChecked()
  })

  it("preselects 'No label' when the target todo has no label", async () => {
    todos.value = {
      data: [{ id: "todo-1", labelId: null }],
      mutate: client.todosMutate,
    }

    renderManager(contextValue({ selectedTodo: { todoId: "todo-1" } }))

    expect(await screen.findByRole("radio", { name: "No label" })).toBeChecked()
  })

  it("applies the selected label to the target todo", async () => {
    client.patchTodosIdLabel.mockResolvedValue({
      id: "todo-1",
      labelId: home.id,
    })
    todos.value = {
      data: [{ id: "todo-1", labelId: work.id }],
      mutate: client.todosMutate,
    }
    const user = userEvent.setup()

    renderManager(contextValue({ selectedTodo: { todoId: "todo-1" } }))

    await user.click(await screen.findByRole("radio", { name: "Home" }))

    expect(client.patchTodosIdLabel).toHaveBeenCalledWith("todo-1", {
      labelId: home.id,
    })
  })

  it("shows selection copy when opened with a target todo", async () => {
    todos.value = {
      data: [{ id: "todo-1", labelId: null }],
      mutate: client.todosMutate,
    }

    renderManager(contextValue({ selectedTodo: { todoId: "todo-1" } }))

    expect(await screen.findByText("Change label")).toBeInTheDocument()
    expect(
      screen.getByText("Select a label for this todo.")
    ).toBeInTheDocument()
  })

  it("shows management copy when opened without a target todo", async () => {
    renderManager(contextValue({ selectedTodo: null }))

    expect(await screen.findByText("Manage labels")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Create, rename, and delete the labels you use on your todos."
      )
    ).toBeInTheDocument()
  })
})
