import { Router } from 'express';
import { z } from 'zod';

import { listTodos } from '../services/todoService.js';
import { registry, TodoSchema } from '../schemas/todo.js';

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

export const todosRouter = Router();

todosRouter.get('/', async (_req, res) => {
  const todos = await listTodos();
  res.json(todos);
});
