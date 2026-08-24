"use client"

import { Check, Circle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import type { Todo } from "@/src/lib/api/generated/model"

import { cn } from "@/lib/utils"

type TodoItemProps = {
  todo: Todo
  isMutating: boolean
  onToggle: (id: string, done: boolean) => Promise<void>
}

function TodoItem({ todo, isMutating, onToggle }: TodoItemProps) {
  return (
    <Item key={todo.id} variant="outline">
      <ItemMedia variant="icon">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onToggle(todo.id, !todo.done)}
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
