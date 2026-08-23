"use client"

import { Check, Circle, Inbox } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/src/lib/api/fetcher"
import { useGetTodos } from "@/src/lib/api/generated/client"

import { cn } from "@/lib/utils"

function TodosList() {
  const { data: todos, error, isLoading } = useGetTodos()

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
        <Item key={todo.id} variant="outline">
          <ItemMedia variant="icon">
            {todo.done ? (
              <Check className="text-muted-foreground" />
            ) : (
              <Circle className="text-muted-foreground/50" />
            )}
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
      ))}
    </ItemGroup>
  )
}

export { TodosList }
