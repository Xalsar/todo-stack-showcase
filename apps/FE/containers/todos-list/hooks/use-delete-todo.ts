"use client"

import { toast } from "sonner"

import { deleteTodosId, useGetTodos } from "@/src/lib/api/generated/client"

type SetMutating = (id: string, on: boolean) => void

function useDeleteTodo(setMutating: SetMutating) {
  const { data: todos, mutate } = useGetTodos()

  const removeTodo = (id: string) =>
    mutate((current) => current?.filter((todo) => todo.id !== id), {
      revalidate: false,
    })

  const onDelete = async (id: string) => {
    setMutating(id, true)
    try {
      removeTodo(id)
      await deleteTodosId(id)
    } catch (e) {
      console.log("Failed to delete todo", e)

      const removed = todos?.find((todo) => todo.id === id)
      if (removed) {
        mutate((current) => [removed, ...(current ?? [])], {
          revalidate: false,
        })
      }
      toast.error("Failed to delete todo. Is the backend running?")
    } finally {
      setMutating(id, false)
    }
  }

  return { onDelete }
}

export { useDeleteTodo }
