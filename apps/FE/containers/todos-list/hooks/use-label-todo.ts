"use client"

import { toast } from "sonner"

import { patchTodosIdLabel, useGetTodos } from "@/src/lib/api/generated/client"

type SetMutating = (id: string, on: boolean) => void

function useLabelTodo(setMutating: SetMutating) {
  const { data: todos, mutate } = useGetTodos()

  const setTodoLabel = (id: string, labelId: string | null) =>
    mutate(
      (current) =>
        current?.map((todo) => (todo.id === id ? { ...todo, labelId } : todo)),
      { revalidate: false }
    )

  const onLabel = async (id: string, labelId: string | null) => {
    const current = todos?.find((todo) => todo.id === id)
    if (!current || current.labelId === labelId) return
    const previous = current.labelId
    setMutating(id, true)
    try {
      await setTodoLabel(id, labelId)
      const updated = await patchTodosIdLabel(id, { labelId })
      await setTodoLabel(id, updated.labelId)
    } catch {
      await setTodoLabel(id, previous)
      toast.error("Failed to update label. Is the backend running?")
    } finally {
      setMutating(id, false)
    }
  }

  return { onLabel }
}

export { useLabelTodo }
