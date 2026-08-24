"use client"

import { toast } from "sonner"

import { patchTodosIdDone, useGetTodos } from "@/src/lib/api/generated/client"

type SetMutating = (id: string, on: boolean) => void

function useToggleTodo(setMutating: SetMutating) {
  const { mutate } = useGetTodos()

  const setTodoDone = (id: string, done: boolean) =>
    mutate(
      (current) =>
        current?.map((todo) => (todo.id === id ? { ...todo, done } : todo)),
      { revalidate: false }
    )

  const onToggle = async (id: string, done: boolean) => {
    setMutating(id, true)
    try {
      await setTodoDone(id, done)
      const updated = await patchTodosIdDone(id, { done })
      await setTodoDone(id, updated.done)
    } catch {
      await setTodoDone(id, !done)
      toast.error("Failed to update todo. Is the backend running?")
    } finally {
      setMutating(id, false)
    }
  }

  return { onToggle }
}

export { useToggleTodo }
