import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useSyncExternalStore } from "react"
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

// Shared by both mocked SWR caches so mutate-driven updates re-render.
const listeners = vi.hoisted(() => new Set<() => void>())

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
    data: [] as Array<{ id: string; labelId: string | null }> | undefined,
    mutate: client.todosMutate,
  },
}))

vi.mock("@/src/lib/api/generated/client", () => ({
  useGetLabels: () => useSyncExternalStore(subscribe, getLabelsSnapshot),
  useGetTodos: () => useSyncExternalStore(subscribe, getTodosSnapshot),
  postLabels: client.postLabels,
  patchLabelsId: client.patchLabelsId,
  deleteLabelsId: client.deleteLabelsId,
  patchTodosIdLabel: client.patchTodosIdLabel,
}))

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getLabelsSnapshot = () => labels.value
const getTodosSnapshot = () => todos.value

import { LabelManager } from "./label-manager"
import { useLabelManager, type SelectedTodo } from "./store/label-manager"

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

// Emulates SWR's bound mutate: applies the updater to the mocked cache and
// notifies subscribers so components re-render.
function applyLabelsMutate(updater?: unknown) {
  if (typeof updater !== "function") return Promise.resolve(labels.value.data)
  const data = (
    updater as (current: Label[] | undefined) => Label[] | undefined
  )(labels.value.data)
  labels.value = { ...labels.value, data }
  notify()
  return Promise.resolve(data)
}

function applyTodosMutate(updater?: unknown) {
  if (typeof updater !== "function") return Promise.resolve(todos.value.data)
  const data = (
    updater as (
      current: Array<{ id: string; labelId: string | null }> | undefined
    ) => Array<{ id: string; labelId: string | null }> | undefined
  )(todos.value.data)
  todos.value = { ...todos.value, data }
  notify()
  return Promise.resolve(data)
}

function notify() {
  listeners.forEach((listener) => listener())
}

function renderManager(selectedTodo: SelectedTodo | null = null) {
  useLabelManager.setState({ open: true, selectedTodo })
  render(<LabelManager />)
}

beforeEach(() => {
  vi.clearAllMocks()
  client.mutate.mockImplementation(applyLabelsMutate)
  client.todosMutate.mockImplementation(applyTodosMutate)
  useLabelManager.setState({ open: false, selectedTodo: null })
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

    renderManager({ todoId: "todo-1" })

    expect(await screen.findByRole("radio", { name: "Work" })).toBeChecked()
  })

  it("preselects 'No label' when the target todo has no label", async () => {
    todos.value = {
      data: [{ id: "todo-1", labelId: null }],
      mutate: client.todosMutate,
    }

    renderManager({ todoId: "todo-1" })

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

    renderManager({ todoId: "todo-1" })

    await user.click(await screen.findByRole("radio", { name: "Home" }))

    expect(client.patchTodosIdLabel).toHaveBeenCalledWith("todo-1", {
      labelId: home.id,
    })
  })

  it("assigns a newly created label to the target todo", async () => {
    const created: Label = {
      id: "3",
      name: "Errands",
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
    }
    client.postLabels.mockResolvedValue(created)
    client.patchTodosIdLabel.mockResolvedValue({
      id: "todo-1",
      labelId: created.id,
    })
    todos.value = {
      data: [{ id: "todo-1", labelId: null }],
      mutate: client.todosMutate,
    }
    const user = userEvent.setup()

    renderManager({ todoId: "todo-1" })

    await user.type(
      await screen.findByPlaceholderText("Add a label…"),
      "Errands"
    )
    await user.click(screen.getByRole("button", { name: "Add label" }))

    await waitFor(() =>
      expect(client.patchTodosIdLabel).toHaveBeenCalledWith("todo-1", {
        labelId: created.id,
      })
    )

    // The row is revealed once, already selected.
    expect(await screen.findByRole("radio", { name: "Errands" })).toBeChecked()
  })

  it("reveals a newly created label only once it is already selected", async () => {
    const created: Label = {
      id: "3",
      name: "Errands",
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
    }
    client.postLabels.mockResolvedValue(created)
    let resolvePatch: (value: {
      id: string
      labelId: string | null
    }) => void = () => {}
    client.patchTodosIdLabel.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePatch = resolve
        })
    )
    todos.value = {
      data: [{ id: "todo-1", labelId: null }],
      mutate: client.todosMutate,
    }
    const user = userEvent.setup()

    renderManager({ todoId: "todo-1" })

    await user.type(
      await screen.findByPlaceholderText("Add a label…"),
      "Errands"
    )
    await user.click(screen.getByRole("button", { name: "Add label" }))

    // Create landed, apply still in flight: no row in the list yet.
    await waitFor(() => expect(client.patchTodosIdLabel).toHaveBeenCalled())
    expect(screen.queryByRole("radio", { name: "Errands" })).toBeNull()

    // Apply resolves: the row appears already checked.
    await act(async () => {
      resolvePatch({ id: "todo-1", labelId: created.id })
    })
    expect(await screen.findByRole("radio", { name: "Errands" })).toBeChecked()
  })

  it("does not assign a new label when there is no target todo", async () => {
    client.postLabels.mockResolvedValue({
      id: "3",
      name: "Errands",
      createdAt: "2024-01-03T00:00:00.000Z",
      updatedAt: "2024-01-03T00:00:00.000Z",
    })
    const user = userEvent.setup()

    renderManager(null)

    await user.type(
      await screen.findByPlaceholderText("Add a label…"),
      "Errands"
    )
    await user.click(screen.getByRole("button", { name: "Add label" }))

    await waitFor(() => expect(client.postLabels).toHaveBeenCalled())
    expect(client.patchTodosIdLabel).not.toHaveBeenCalled()

    // Without a target todo the optimistic reveal still applies.
    expect(await screen.findByText("Errands")).toBeInTheDocument()
  })

  it("shows selection copy when opened with a target todo", async () => {
    todos.value = {
      data: [{ id: "todo-1", labelId: null }],
      mutate: client.todosMutate,
    }

    renderManager({ todoId: "todo-1" })

    expect(await screen.findByText("Change label")).toBeInTheDocument()
    expect(
      screen.getByText("Select a label for this todo.")
    ).toBeInTheDocument()
  })

  it("shows management copy when opened without a target todo", async () => {
    renderManager(null)

    expect(await screen.findByText("Manage labels")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Create, rename, and delete the labels you use on your todos."
      )
    ).toBeInTheDocument()
  })

  it("opens the delete dialog when the delete button is clicked", async () => {
    const user = userEvent.setup()
    renderManager(null)

    await user.click(await screen.findByRole("button", { name: "Delete Work" }))

    expect(
      await screen.findByText(/permanently deletes the label/i)
    ).toBeInTheDocument()
  })

  it("shows how many todos use the label in the delete dialog", async () => {
    todos.value = {
      data: [
        { id: "todo-1", labelId: work.id },
        { id: "todo-2", labelId: work.id },
        { id: "todo-3", labelId: home.id },
      ],
      mutate: client.todosMutate,
    }
    const user = userEvent.setup()
    renderManager(null)

    await user.click(await screen.findByRole("button", { name: "Delete Work" }))

    expect(await screen.findByText(/applied to 2 todos/i)).toBeInTheDocument()
  })

  it("reports no affected todos when the todo list is unavailable", async () => {
    todos.value = { data: undefined, mutate: client.todosMutate }
    const user = userEvent.setup()
    renderManager(null)

    await user.click(await screen.findByRole("button", { name: "Delete Work" }))

    expect(
      await screen.findByText(/no todos use this label/i)
    ).toBeInTheDocument()
  })

  it("deletes the label when the dialog is confirmed", async () => {
    const user = userEvent.setup()
    renderManager(null)

    await user.click(await screen.findByRole("button", { name: "Delete Work" }))
    await user.click(
      await screen.findByRole("button", { name: "Delete label" })
    )

    await waitFor(() => expect(client.deleteLabelsId).toHaveBeenCalledWith("1"))
  })

  it("closes the delete dialog when cancel is clicked", async () => {
    const user = userEvent.setup()
    renderManager(null)

    await user.click(await screen.findByRole("button", { name: "Delete Work" }))
    await user.click(await screen.findByRole("button", { name: "Cancel" }))

    expect(
      screen.queryByText(/permanently deletes the label/i)
    ).not.toBeInTheDocument()
    expect(client.deleteLabelsId).not.toHaveBeenCalled()
  })
})
