import { PrismaClient } from '@prisma/client';

import type { TodoDto } from '../schemas/todo.js';

const prisma = new PrismaClient();

export async function listTodos(): Promise<TodoDto[]> {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });

  return todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    done: todo.done,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  }));
}
