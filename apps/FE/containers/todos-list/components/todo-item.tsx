"use client"

import { Check, Circle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import type { Todo } from "@/src/lib/api/generated/model"

import { cn } from "@/lib/utils"

type TodoItemProps = {
  todo: Todo
  isMutating: boolean
  onToggle: (id: string, done: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function TodoItem({ todo, isMutating, onToggle, onDelete }: TodoItemProps) {
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
      <ItemActions>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(todo.id)}
          disabled={isMutating}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-100 dark:hover:bg-destructive/20"
          aria-label="Delete todo"
        >
          <Trash2 />
        </Button>
      </ItemActions>
    </Item>
  )
}

export { TodoItem }
