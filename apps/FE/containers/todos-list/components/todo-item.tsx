"use client"

import { Check, Circle, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { EditTodoForm } from "@/containers/todos-list/components/edit-todo-form"
import type { Todo } from "@/src/lib/api/generated/model"

import { cn } from "@/lib/utils"

type TodoItemProps = {
  todo: Todo
  isMutating: boolean
  editing: boolean
  onToggle: (id: string, done: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onStartEdit: () => void
  onCancelEdit: () => void
  onSubmitEdit: (title: string) => Promise<void>
}

function TodoItem({
  todo,
  isMutating,
  editing,
  onToggle,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
}: TodoItemProps) {
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
        {editing ? (
          <EditTodoForm
            initialTitle={todo.title}
            isSubmitting={isMutating}
            onSubmit={(title) => onSubmitEdit(title)}
            onCancel={onCancelEdit}
          />
        ) : (
          <ItemTitle
            role="button"
            tabIndex={0}
            onClick={onStartEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onStartEdit()
              }
            }}
            className={cn(
              "-mx-1 cursor-pointer rounded-sm px-1 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              todo.done && "font-normal text-muted-foreground line-through"
            )}
          >
            {todo.title}
          </ItemTitle>
        )}
      </ItemContent>
      {editing ? null : (
        <ItemActions>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onStartEdit}
            disabled={isMutating}
            className="text-muted-foreground disabled:opacity-100"
            aria-label="Edit todo"
          >
            <Pencil />
          </Button>
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
      )}
    </Item>
  )
}

export { TodoItem }
