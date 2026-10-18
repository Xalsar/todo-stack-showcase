"use client"

import { useState } from "react"
import { toast } from "sonner"

import { deleteLabelsId, useGetTodos } from "@/src/lib/api/generated/client"

import { useLabels } from "./use-labels"

function useDeleteLabel() {
  const { data: labels, mutate } = useLabels()
  const { data: todos, mutate: mutateTodos } = useGetTodos()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const onDelete = async (id: string): Promise<boolean> => {
    const removedIndex = labels?.findIndex((label) => label.id === id) ?? -1
    const removed = labels?.[removedIndex]
    const affectedTodoIds = new Set(
      todos?.filter((todo) => todo.labelId === id).map((todo) => todo.id)
    )
    setDeletingId(id)

    try {
      await mutate((current) => current?.filter((label) => label.id !== id), {
        revalidate: false,
      })
      await mutateTodos(
        (current) =>
          current?.map((todo) =>
            todo.labelId === id ? { ...todo, labelId: null } : todo
          ),
        { revalidate: false }
      )
      await deleteLabelsId(id)
      return true
    } catch {
      if (removed) {
        await mutate(
          (current) => {
            const next = [...(current ?? [])]
            next.splice(Math.min(removedIndex, next.length), 0, removed)
            return next
          },
          { revalidate: false }
        )
      }
      // Only restore todos the user hasn't relabeled in the meantime.
      await mutateTodos(
        (current) =>
          current?.map((todo) =>
            affectedTodoIds.has(todo.id) && todo.labelId === null
              ? { ...todo, labelId: id }
              : todo
          ),
        { revalidate: false }
      )
      toast.error("Failed to delete label. Is the backend running?")
      return false
    } finally {
      setDeletingId(null)
    }
  }

  return { onDelete, deletingId }
}

export { useDeleteLabel }
