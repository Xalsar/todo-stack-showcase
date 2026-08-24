import { Router } from "express"
import { z } from "zod"

import {
  createTodo,
  deleteTodo,
  listTodos,
  setTodoDone,
  updateTodoTitle,
} from "../services/todoService.js"
import {
  CreateTodoSchema,
  registry,
  SetTodoDoneSchema,
  TodoIdParamsSchema,
  TodoSchema,
  UpdateTodoTitleSchema,
} from "../schemas/todo.js"

export const todosRouter = Router()

registry.registerPath({
  method: "get",
  path: "/todos",
  responses: {
    200: {
      description: "List of todos",
      content: {
        "application/json": {
          schema: z.array(TodoSchema),
        },
      },
    },
  },
})

todosRouter.get("/", async (_req, res) => {
  const todos = await listTodos()
  res.json(todos)
})

registry.registerPath({
  method: "post",
  path: "/todos",
  request: {
    body: {
      description: "Todo to create",
      required: true,
      content: {
        "application/json": {
          schema: CreateTodoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created todo",
      content: {
        "application/json": {
          schema: TodoSchema,
        },
      },
    },
  },
})

todosRouter.post("/", async (req, res) => {
  const parsed = CreateTodoSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.issues })
    return
  }

  const todo = await createTodo(parsed.data)
  res.status(201).json(todo)
})

registry.registerPath({
  method: "patch",
  path: "/todos/{id}/done",
  request: {
    params: TodoIdParamsSchema,
    body: {
      description: "Done state to set",
      required: true,
      content: {
        "application/json": {
          schema: SetTodoDoneSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated todo",
      content: {
        "application/json": {
          schema: TodoSchema,
        },
      },
    },
    404: {
      description: "Todo not found",
    },
  },
})

todosRouter.patch("/:id/done", async (req, res) => {
  const params = TodoIdParamsSchema.safeParse(req.params)
  const body = SetTodoDoneSchema.safeParse(req.body)
  if (!params.success || !body.success) {
    res.status(400).json({
      errors: [
        ...(params.success ? [] : params.error.issues),
        ...(body.success ? [] : body.error.issues),
      ],
    })
    return
  }

  const todo = await setTodoDone(params.data.id, body.data.done)
  if (!todo) {
    res.status(404).json({ error: "Todo not found" })
    return
  }

  res.json(todo)
})

registry.registerPath({
  method: "patch",
  path: "/todos/{id}/title",
  request: {
    params: TodoIdParamsSchema,
    body: {
      description: "New todo title",
      required: true,
      content: {
        "application/json": {
          schema: UpdateTodoTitleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated todo",
      content: {
        "application/json": {
          schema: TodoSchema,
        },
      },
    },
    404: {
      description: "Todo not found",
    },
  },
})

todosRouter.patch("/:id/title", async (req, res) => {
  const params = TodoIdParamsSchema.safeParse(req.params)
  const body = UpdateTodoTitleSchema.safeParse(req.body)
  if (!params.success || !body.success) {
    res.status(400).json({
      errors: [
        ...(params.success ? [] : params.error.issues),
        ...(body.success ? [] : body.error.issues),
      ],
    })
    return
  }

  const todo = await updateTodoTitle(params.data.id, body.data.title)
  if (!todo) {
    res.status(404).json({ error: "Todo not found" })
    return
  }

  res.json(todo)
})

registry.registerPath({
  method: "delete",
  path: "/todos/{id}",
  request: {
    params: TodoIdParamsSchema,
  },
  responses: {
    204: {
      description: "Todo deleted",
    },
    404: {
      description: "Todo not found",
    },
  },
})

todosRouter.delete("/:id", async (req, res) => {
  const params = TodoIdParamsSchema.safeParse(req.params)
  if (!params.success) {
    res.status(400).json({ errors: params.error.issues })
    return
  }

  const deleted = await deleteTodo(params.data.id)
  if (!deleted) {
    res.status(404).json({ error: "Todo not found" })
    return
  }

  res.status(204).end()
})
