"use client"

import { Check, Circle, Inbox } from "lucide-react"
import { toast } from "sonner"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/src/lib/api/fetcher"
import {
  useGetTodos,
  usePatchTodosIdDone,
} from "@/src/lib/api/generated/client"
import type { Todo } from "@/src/lib/api/generated/model"

import { cn } from "@/lib/utils"

type TodoItemProps = {
  todo: Todo
  onToggle: (id: string, done: boolean) => Promise<void>
}

function TodoItem({ todo, onToggle }: TodoItemProps) {
  const { trigger, isMutating } = usePatchTodosIdDone(todo.id, {
    swr: { revalidate: false },
  })

  const handleClick = async () => {
    const next = !todo.done
    try {
      await onToggle(todo.id, next)
      const updated = await trigger({ done: next })
      await onToggle(todo.id, updated.done)
    } catch {
      await onToggle(todo.id, todo.done)
      toast.error("Failed to update todo. Is the backend running?")
    }
  }

  return (
    <Item key={todo.id} variant="outline">
      <ItemMedia variant="icon">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleClick}
          disabled={isMutating}
          className="disabled:opacity-100"
          aria-pressed={todo.done}
          aria-label={todo.done ? "Mark as not done" : "Mark as done"}
        >
          {todo.done ? (
            <Check className="text-muted-foreground" />
          ) : (
            <Circle className="text-muted-foreground/50" />
          )}
        </Button>
      </ItemMedia>
      <ItemContent>
        <ItemTitle
          className={cn(
            todo.done && "font-normal text-muted-foreground line-through"
          )}
        >
          {todo.title}
        </ItemTitle>
      </ItemContent>
    </Item>
  )
}

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
