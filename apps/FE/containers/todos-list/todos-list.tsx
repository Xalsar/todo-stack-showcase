"use client"

import { Inbox } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ItemGroup } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { TodoItem } from "@/containers/todos-list/components/todo-item"
import { ApiError } from "@/src/lib/api/fetcher"
import { useGetTodos } from "@/src/lib/api/generated/client"

function TodosList() {
  const { data: todos, error, isLoading, mutate } = useGetTodos()

  const onToggle = async (id: string, done: boolean) => {
    await mutate(
      (current) =>
        current?.map((todo) =>
          todo.id === id ? { ...todo, done } : todo
        ),
      { revalidate: false }
    )
  }

  if (isLoading) {
    return (
      <div aria-hidden className="flex flex-col gap-2">
        <Skeleton className="h-[52px] w-full rounded-lg" />
        <Skeleton className="h-[52px] w-full rounded-lg" />
        <Skeleton className="h-[52px] w-full rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Failed to load todos
        {error instanceof ApiError ? ` (API error ${error.status})` : ""}.
        Is the backend running?
      </p>
    )
  }

  if (!todos?.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>No todos yet</EmptyTitle>
          <EmptyDescription>
            Use the field above to add your first one.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ItemGroup>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ItemGroup>
  )
}

export { TodosList }
