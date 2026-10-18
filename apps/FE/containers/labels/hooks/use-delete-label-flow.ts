"use client"

import { useCallback, useState } from "react"

import { useGetTodos } from "@/src/lib/api/generated/client"
import type { Label } from "@/src/lib/api/generated/model"

import { useDeleteLabel } from "./use-delete-label"
import { useLabels } from "./use-labels"

// Deletes unused labels straight away; labels still applied to todos go
// through the confirmation dialog first.
function useDeleteLabelFlow() {
  const { data: labels } = useLabels()
  const { data: todos } = useGetTodos()
  const { onDelete, deletingId } = useDeleteLabel()
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const countTodosUsing = useCallback(
    (labelId: string) =>
      todos?.filter((todo) => todo.labelId === labelId).length,
    [todos]
  )

  const requestDelete = useCallback(
    (id: string) => {
      const label = labels?.find((l) => l.id === id)
      if (!label) return

      if (countTodosUsing(id) === 0) {
        void onDelete(id)
        return
      }
      setLabelToDelete(label)
      setDeleteDialogOpen(true)
    },
    [labels, countTodosUsing, onDelete]
  )

  const deleteDialogProps = labelToDelete && {
    open: deleteDialogOpen,
    labelName: labelToDelete.name,
    affectedTodos: countTodosUsing(labelToDelete.id),
    onConfirm: () => {
      setDeleteDialogOpen(false)
      void onDelete(labelToDelete.id)
    },
    onClose: () => setDeleteDialogOpen(false),
    onClosed: () => setLabelToDelete(null),
  }

  return { requestDelete, deletingId, deleteDialogProps }
}

export { useDeleteLabelFlow }
