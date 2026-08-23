"use client"

import { Check, Circle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { usePatchTodosIdDone } from "@/src/lib/api/generated/client"
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

export { TodoItem }
