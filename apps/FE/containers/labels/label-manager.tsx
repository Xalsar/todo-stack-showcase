"use client"

import { Tag } from "lucide-react"
import { useCallback, useMemo } from "react"

import { AddForm } from "@/components/add-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetTodos } from "@/src/lib/api/generated/client"

import { LabelList } from "./components/label-list"
import { useApplyLabelToTodo } from "./hooks/use-apply-label-to-todo"
import { useCreateLabel } from "./hooks/use-create-label"
import { useDeleteLabel } from "./hooks/use-delete-label"
import { useLabelManager } from "./context/label-manager"
import { useLabels } from "./hooks/use-labels"
import { useRenameLabel } from "./hooks/use-rename-label"
import { isNameConflict } from "./label-errors"

function LabelManager() {
  const { open, onOpenChange, selectedTodo } = useLabelManager()
  const { data: labels, error, isLoading } = useLabels()
  const { data: todos } = useGetTodos()
  const { onCreate, isSubmitting, failed } = useCreateLabel()
  const { onRename, renamingId } = useRenameLabel()
  const { onDelete, deletingId } = useDeleteLabel()
  const { applyLabel } = useApplyLabelToTodo()

  const selectedLabelId = useMemo(() => {
    if (!selectedTodo) return undefined
    return (
      todos?.find((todo) => todo.id === selectedTodo.todoId)?.labelId ?? null
    )
  }, [selectedTodo, todos])

  const handleSelectLabel = useCallback(
    (labelId: string | null) => {
      if (!selectedTodo) return
      applyLabel(selectedTodo.todoId, labelId)
    },
    [selectedTodo, applyLabel]
  )

  const handleCreate = useCallback(
    async (name: string) => {
      const created = await onCreate(name)
      if (created && selectedTodo) {
        await applyLabel(selectedTodo.todoId, created.id)
      }
      return created !== null
    },
    [onCreate, applyLabel, selectedTodo]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedTodo ? "Change label" : "Manage labels"}
          </DialogTitle>
          <DialogDescription>
            {selectedTodo
              ? "Select a label for this todo."
              : "Create, rename, and delete the labels you use on your todos."}
          </DialogDescription>
        </DialogHeader>

        <AddForm
          label="New label"
          placeholder="Add a label…"
          submitLabel="Add label"
          requiredMessage="Name is required"
          failureMessage="Failed to save label. Is the backend running?"
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          failed={failed}
          mapError={(error) =>
            isNameConflict(error)
              ? "A label with this name already exists"
              : "Failed to save label"
          }
        />

        {isLoading ? (
          <div aria-hidden className="flex flex-col gap-2">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive" role="alert">
            Failed to load labels. Is the backend running?
          </p>
        ) : !labels?.length ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Tag />
              </EmptyMedia>
              <EmptyTitle>No labels yet</EmptyTitle>
              <EmptyDescription>
                Add your first label with the field above.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <LabelList
            labels={labels}
            renamingId={renamingId}
            deletingId={deletingId}
            onRename={onRename}
            onDelete={onDelete}
            selectedId={selectedLabelId}
            onSelect={handleSelectLabel}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export { LabelManager }
