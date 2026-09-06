import { Prisma } from "@prisma/client"

import { prisma } from "../lib/prisma.js"
import type { CreateTodoDto, TodoDto } from "../schemas/todo.js"

export async function listTodos(): Promise<TodoDto[]> {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: "desc" } })

  return todos.map(toDto)
}

export async function createTodo(input: CreateTodoDto): Promise<TodoDto> {
  const todo = await prisma.todo.create({ data: { title: input.title } })

  return toDto(todo)
}

export async function setTodoDone(
  id: string,
  done: boolean
): Promise<TodoDto | null> {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: { done },
    })

    return toDto(todo)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null
    }
    throw error
  }
}

export async function updateTodoTitle(
  id: string,
  title: string
): Promise<TodoDto | null> {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: { title },
    })

    return toDto(todo)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null
    }
    throw error
  }
}

export type UpdateTodoLabelResult =
  | { ok: true; todo: TodoDto }
  | { ok: false; reason: "todo-not-found" | "label-not-found" }

export async function updateTodoLabel(
  id: string,
  labelId: string | null
): Promise<UpdateTodoLabelResult> {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: { labelId },
    })

    return { ok: true, todo: toDto(todo) }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { ok: false, reason: "todo-not-found" }
      }
      if (error.code === "P2003") {
        return { ok: false, reason: "label-not-found" }
      }
    }
    throw error
  }
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    await prisma.todo.delete({ where: { id } })

    return true
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return false
    }
    throw error
  }
}

function toDto(todo: {
  id: string
  title: string
  done: boolean
  labelId: string | null
  createdAt: Date
  updatedAt: Date
}): TodoDto {
  return {
    id: todo.id,
    title: todo.title,
    done: todo.done,
    labelId: todo.labelId,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  }
}
