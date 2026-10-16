"use client"

import { Check, Circle, Pencil, Settings2, Tags, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { InlineEditForm } from "@/components/inline-edit-form"
import type { Label, Todo } from "@/src/lib/api/generated/model"

import { cn } from "@/lib/utils"

type TodoItemProps = {
  todo: Todo
  labels: Label[]
  isMutating: boolean
  editing: boolean
  onToggle: (id: string, done: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onLabel: (id: string, labelId: string | null) => Promise<void>
  onManageLabels: () => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSubmitEdit: (title: string) => Promise<void>
}

function TodoItem({
  todo,
  labels,
  isMutating,
  editing,
  onToggle,
  onDelete,
  onLabel,
  onManageLabels,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
}: TodoItemProps) {
  const label = labels.find((l) => l.id === todo.labelId)

  return (
    <Item key={todo.id} variant="outline" role="listitem">
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
          <InlineEditForm
            defaultValue={todo.title}
            inputLabel="Edit todo title"
            saveLabel="Save todo"
            cancelLabel="Cancel editing"
            requiredMessage="Title is required"
            isSubmitting={isMutating}
            onSubmit={(title) => onSubmitEdit(title)}
            onCancel={onCancelEdit}
          />
        ) : (
          <ItemTitle
            role="button"
            tabIndex={0}
            aria-disabled={isMutating || undefined}
            onClick={() => {
              if (!isMutating) onStartEdit()
            }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isMutating) {
                e.preventDefault()
                onStartEdit()
              }
            }}
            className={cn(
              "-mx-1 w-full cursor-pointer rounded-sm px-1 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              todo.done && "font-normal text-muted-foreground line-through"
            )}
          >
            {todo.title}
          </ItemTitle>
        )}
      </ItemContent>
      {editing ? null : (
        <ItemActions>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  disabled={isMutating}
                  className="px-2 text-muted-foreground disabled:opacity-100"
                  aria-label="View labels"
                >
                  {label ? (
                    <span className="text-sm font-normal">{label.name}</span>
                  ) : null}
                  <Tags />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              side="bottom"
              className="w-auto min-w-48"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>Labels</DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-muted-foreground"
                  disabled={todo.labelId === null}
                  onClick={() => onLabel(todo.id, null)}
                >
                  No label
                </DropdownMenuItem>
                {labels.length > 0 ? (
                  labels.map((label) => (
                    <DropdownMenuItem
                      key={label.id}
                      disabled={label.id === todo.labelId}
                      onClick={() => onLabel(todo.id, label.id)}
                    >
                      {label.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No labels</DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onManageLabels}>
                <Settings2 />
                Manage labels…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
