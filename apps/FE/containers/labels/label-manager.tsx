"use client"

import { useCallback, useMemo, useState } from "react"

import { AddForm } from "@/components/add-form"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useGetTodos } from "@/src/lib/api/generated/client"
import type { Label } from "@/src/lib/api/generated/model"

import { DeleteLabelDialog } from "./components/delete-label-dialog"
import { LabelsContent } from "./components/labels-content"
import { useApplyLabelToTodo } from "./hooks/use-apply-label-to-todo"
import { useCreateLabel } from "./hooks/use-create-label"
import { useDeleteLabel } from "./hooks/use-delete-label"
import { useIsDesktop } from "./hooks/use-is-desktop"
import { useLabelManager } from "./store/label-manager"
import { useLabels } from "./hooks/use-labels"
import { useRenameLabel } from "./hooks/use-rename-label"
import { isNameConflict } from "./label-errors"

function LabelManager() {
  const { open, onOpenChange, selectedTodo } = useLabelManager()
  const isDesktop = useIsDesktop()
  const { data: labels, error, isLoading } = useLabels()
  const { data: todos } = useGetTodos()
  const { onCreate, isSubmitting, failed } = useCreateLabel()
  const { onRename, renamingId } = useRenameLabel()
  const { onDelete, deletingId } = useDeleteLabel()
  const { applyLabel } = useApplyLabelToTodo()
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null)

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

  const handleDeleteRequest = useCallback(
    (id: string) => {
      const label = labels?.find((l) => l.id === id)
      if (label) setDeletingLabel(label)
    },
    [labels]
  )

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        swipeDirection={isDesktop ? "right" : "down"}
      >
        <DrawerContent className="my-2">
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {selectedTodo ? "Change label" : "Manage labels"}
            </DrawerTitle>
            <DrawerDescription>
              {selectedTodo
                ? "Select a label for this todo."
                : "Create, rename, and delete the labels you use on your todos."}
            </DrawerDescription>
          </DrawerHeader>

          <div className="mt-2 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
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

            <LabelsContent
              isLoading={isLoading}
              isError={Boolean(error)}
              labels={labels}
              renamingId={renamingId}
              deletingId={deletingId}
              onRename={onRename}
              onDelete={handleDeleteRequest}
              selectedId={selectedLabelId}
              onSelect={handleSelectLabel}
            />
          </div>

          <div className="border-t p-4">
            <DrawerClose
              render={
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              }
            />
          </div>
        </DrawerContent>
      </Drawer>

      {deletingLabel && (
        <DeleteLabelDialog
          labelName={deletingLabel.name}
          isDeleting={deletingId === deletingLabel.id}
          onConfirm={() => onDelete(deletingLabel.id)}
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setDeletingLabel(null)
          }}
        />
      )}
    </>
  )
}

export { LabelManager }
