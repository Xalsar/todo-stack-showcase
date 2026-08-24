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
import { AddTodoForm } from "@/containers/todos-list/components/add-todo-form"
import { TodoItem } from "@/containers/todos-list/components/todo-item"
import { useCreateTodo } from "@/containers/todos-list/hooks/use-create-todo"
import { useDeleteTodo } from "@/containers/todos-list/hooks/use-delete-todo"
import { useEditTodo } from "@/containers/todos-list/hooks/use-edit-todo"
import { useMutatingTodos } from "@/containers/todos-list/hooks/use-mutating-todos"
import { useToggleTodo } from "@/containers/todos-list/hooks/use-toggle-todo"
import { ApiError } from "@/src/lib/api/fetcher"
import { useGetTodos } from "@/src/lib/api/generated/client"

function TodosList() {
  const { data: todos, error, isLoading } = useGetTodos()

  const { setMutating, isMutating } = useMutatingTodos()

  const create = useCreateTodo()
  const { onToggle } = useToggleTodo(setMutating)
  const { editingId, onStartEdit, onCancelEdit, onUpdateTitle } =
    useEditTodo(setMutating)
  const { onDelete } = useDeleteTodo(setMutating)

  return (
    <div className="flex flex-col gap-4">
      <AddTodoForm
        onSubmit={create.onSubmit}
        isSubmitting={create.isSubmitting}
        failed={create.failed}
      />

      {isLoading ? (
        <div aria-hidden className="flex flex-col gap-2">
          <Skeleton className="h-[52px] w-full rounded-lg" />
          <Skeleton className="h-[52px] w-full rounded-lg" />
          <Skeleton className="h-[52px] w-full rounded-lg" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive" role="alert">
          Failed to load todos
          {error instanceof ApiError ? ` (API error ${error.status})` : ""}. Is
          the backend running?
        </p>
      ) : !todos?.length ? (
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
      ) : (
        <ItemGroup>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isMutating={isMutating(todo.id)}
              editing={editingId === todo.id}
              onToggle={onToggle}
              onDelete={onDelete}
              onStartEdit={() => onStartEdit(todo.id)}
              onCancelEdit={onCancelEdit}
              onSubmitEdit={(title) => onUpdateTitle(todo.id, title)}
            />
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

export { TodosList }
