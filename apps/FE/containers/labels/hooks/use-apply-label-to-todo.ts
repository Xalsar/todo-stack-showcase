"use client"

import { toast } from "sonner"

import { patchTodosIdLabel, useGetTodos } from "@/src/lib/api/generated/client"

function useApplyLabelToTodo() {
  const { data: todos, mutate } = useGetTodos()

  const setTodoLabel = (id: string, labelId: string | null) =>
    mutate(
      (current) =>
        current?.map((todo) => (todo.id === id ? { ...todo, labelId } : todo)),
      { revalidate: false }
    )

  const applyLabel = async (id: string, labelId: string | null) => {
    const current = todos?.find((todo) => todo.id === id)
    if (!current || current.labelId === labelId) return
    const previous = current.labelId
    try {
      await setTodoLabel(id, labelId)
      const updated = await patchTodosIdLabel(id, { labelId })
      await setTodoLabel(id, updated.labelId)
    } catch {
      await setTodoLabel(id, previous)
      toast.error("Failed to update label. Is the backend running?")
    }
  }

  return { applyLabel }
}

export { useApplyLabelToTodo }
