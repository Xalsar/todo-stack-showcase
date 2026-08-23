import { Router } from 'express';
import { z } from 'zod';

import { createTodo, listTodos } from '../services/todoService.js';
import { CreateTodoSchema, registry, TodoSchema } from '../schemas/todo.js';

registry.registerPath({
  method: 'get',
  path: '/todos',
  responses: {
    200: {
      description: 'List of todos',
      content: {
        'application/json': {
          schema: z.array(TodoSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/todos',
  request: {
    body: {
      description: 'Todo to create',
      required: true,
      content: {
        'application/json': {
          schema: CreateTodoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created todo',
      content: {
        'application/json': {
          schema: TodoSchema,
        },
      },
    },
  },
});

export const todosRouter = Router();

todosRouter.get('/', async (_req, res) => {
  const todos = await listTodos();
  res.json(todos);
});

todosRouter.post('/', async (req, res) => {
  const parsed = CreateTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.issues });
    return;
  }

  const todo = await createTodo(parsed.data);
  res.status(201).json(todo);
});
