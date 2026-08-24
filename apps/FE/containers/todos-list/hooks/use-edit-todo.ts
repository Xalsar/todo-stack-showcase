"use client"

import { useState } from "react"
import { toast } from "sonner"

import { patchTodosIdTitle, useGetTodos } from "@/src/lib/api/generated/client"

type SetMutating = (id: string, on: boolean) => void

function useEditTodo(setMutating: SetMutating) {
  const { data: todos, mutate } = useGetTodos()
  const [editingId, setEditingId] = useState<string | null>(null)

  const setTodoTitle = (id: string, title: string) =>
    mutate(
      (current) =>
        current?.map((todo) => (todo.id === id ? { ...todo, title } : todo)),
      { revalidate: false }
    )

  const onStartEdit = (id: string) => setEditingId(id)
  const onCancelEdit = () => setEditingId(null)

  const onUpdateTitle = async (id: string, title: string) => {
    const current = todos?.find((todo) => todo.id === id)
    if (!current || title === current.title) {
      setEditingId(null)
      return
    }
    setMutating(id, true)
    try {
      await setTodoTitle(id, title)
      const updated = await patchTodosIdTitle(id, { title })
      await setTodoTitle(id, updated.title)
      setEditingId(null)
    } catch {
      await setTodoTitle(id, current.title)
      toast.error("Failed to update todo. Is the backend running?")
    } finally {
      setMutating(id, false)
    }
  }

  return { editingId, onStartEdit, onCancelEdit, onUpdateTitle }
}

export { useEditTodo }
