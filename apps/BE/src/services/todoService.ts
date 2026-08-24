import { Prisma, PrismaClient } from "@prisma/client"

import type { CreateTodoDto, TodoDto } from "../schemas/todo.js"

const prisma = new PrismaClient()

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
  createdAt: Date
  updatedAt: Date
}): TodoDto {
  return {
    id: todo.id,
    title: todo.title,
    done: todo.done,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  }
}
