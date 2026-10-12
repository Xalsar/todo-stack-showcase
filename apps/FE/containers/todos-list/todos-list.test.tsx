import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/src/lib/api/fetcher"

const clientMock = vi.hoisted(() => ({
  todos: {
    data: undefined as unknown,
    error: undefined as unknown,
    isLoading: false,
  },
  labels: { data: [] as unknown },
  mutate: vi.fn(),
  post: vi.fn(),
  patchDone: vi.fn(),
  patchTitle: vi.fn(),
  patchLabel: vi.fn(),
  deleteTodo: vi.fn(),
}))

vi.mock("@/src/lib/api/generated/client", () => ({
  useGetTodos: () => ({ ...clientMock.todos, mutate: clientMock.mutate }),
  useGetLabels: () => clientMock.labels,
  usePostTodos: () => ({ trigger: clientMock.post }),
  patchTodosIdDone: clientMock.patchDone,
  patchTodosIdTitle: clientMock.patchTitle,
  patchTodosIdLabel: clientMock.patchLabel,
  deleteTodosId: clientMock.deleteTodo,
}))

vi.mock("@/containers/labels/hooks/use-label-manager", () => ({
  useLabelManager: () => ({
    open: false,
    onOpenChange: vi.fn(),
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
  }),
}))

vi.mock("@/containers/labels/hooks/use-labels", () => ({
  useLabels: () => clientMock.labels,
}))

import { TodosList } from "./todos-list"

const todo = {
  id: "todo-1",
  title: "Write tests",
  done: false,
  labelId: null,
  userId: "user-1",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

const workLabel = {
  id: "label-1",
  name: "Work",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  clientMock.todos = { data: undefined, error: undefined, isLoading: false }
  clientMock.labels = { data: [] }
})

describe("TodosList", () => {
  it("shows skeleton placeholders while loading", () => {
    clientMock.todos = { data: undefined, error: undefined, isLoading: true }

    const { container } = render(<TodosList />)

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0)
  })

  it("shows an API error with its status", () => {
    clientMock.todos = {
      data: undefined,
      error: new ApiError(500, "boom"),
      isLoading: false,
    }

    render(<TodosList />)

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to load todos (API error 500)"
    )
  })

  it("shows a generic error for non-API failures", () => {
    clientMock.todos = {
      data: undefined,
      error: new Error("boom"),
      isLoading: false,
    }

    render(<TodosList />)

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load todos")
  })

  it("shows the empty state when there are no todos", () => {
    clientMock.todos = { data: [], error: undefined, isLoading: false }

    render(<TodosList />)

    expect(screen.getByText("No todos yet")).toBeInTheDocument()
  })

  it("renders the todos", () => {
    clientMock.todos = { data: [todo], error: undefined, isLoading: false }
    clientMock.labels = { data: [workLabel] }

    render(<TodosList />)

    expect(screen.getByText("Write tests")).toBeInTheDocument()
  })

  it("renders the todos without label data", () => {
    clientMock.todos = { data: [todo], error: undefined, isLoading: false }
    clientMock.labels = { data: undefined }

    render(<TodosList />)

    expect(screen.getByText("Write tests")).toBeInTheDocument()
  })

  it("creates a todo through the add form", async () => {
    clientMock.todos = { data: [], error: undefined, isLoading: false }
    clientMock.post.mockResolvedValue({ ...todo, id: "todo-2", title: "New" })
    const user = userEvent.setup()

    render(<TodosList />)
    await user.type(screen.getByLabelText("New todo"), "New")
    await user.click(screen.getByRole("button", { name: /add todo/i }))

    expect(clientMock.post).toHaveBeenCalledWith(
      { title: "New" },
      { revalidate: false }
    )
  })

  it("edits a todo from the list", async () => {
    clientMock.todos = { data: [todo], error: undefined, isLoading: false }
    clientMock.patchTitle.mockResolvedValue({ ...todo, title: "Renamed" })
    const user = userEvent.setup()

    render(<TodosList />)
    await user.click(screen.getByRole("button", { name: "Edit todo" }))
    const input = screen.getByLabelText("Edit todo title")
    await user.clear(input)
    await user.type(input, "Renamed")
    await user.click(screen.getByRole("button", { name: "Save todo" }))

    expect(clientMock.patchTitle).toHaveBeenCalledWith("todo-1", {
      title: "Renamed",
    })
  })

  it("cancels editing a todo", async () => {
    clientMock.todos = { data: [todo], error: undefined, isLoading: false }
    const user = userEvent.setup()

    render(<TodosList />)
    await user.click(screen.getByRole("button", { name: "Edit todo" }))
    await user.click(screen.getByRole("button", { name: "Cancel editing" }))

    expect(screen.getByText("Write tests")).toBeInTheDocument()
  })
})
