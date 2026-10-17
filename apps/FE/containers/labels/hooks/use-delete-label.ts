"use client"

import { useState } from "react"
import { toast } from "sonner"

import { deleteLabelsId, useGetTodos } from "@/src/lib/api/generated/client"

import { useLabels } from "./use-labels"

function useDeleteLabel() {
  const { data: labels, mutate } = useLabels()
  const { mutate: mutateTodos } = useGetTodos()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const onDelete = async (id: string): Promise<boolean> => {
    const removed = labels?.find((label) => label.id === id)
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
        await mutate((current) => [removed, ...(current ?? [])], {
          revalidate: false,
        })
      }
      toast.error("Failed to delete label. Is the backend running?")
      return false
    } finally {
      setDeletingId(null)
    }
  }

  return { onDelete, deletingId }
}

export { useDeleteLabel }
