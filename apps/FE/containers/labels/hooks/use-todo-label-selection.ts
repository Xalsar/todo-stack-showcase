"use client"

import { useCallback, useMemo } from "react"

import { useGetTodos } from "@/src/lib/api/generated/client"

import { useLabelManager } from "../store/label-manager"
import { useApplyLabelToTodo } from "./use-apply-label-to-todo"

// The label of the todo the manager was opened for, and a way to change it.
// `selectedLabelId` is undefined when the manager isn't scoped to a todo.
function useTodoLabelSelection() {
  const { selectedTodo } = useLabelManager()
  const { data: todos } = useGetTodos()
  const { applyLabel } = useApplyLabelToTodo()

  const selectedLabelId = useMemo(() => {
    if (!selectedTodo) return undefined
    return (
      todos?.find((todo) => todo.id === selectedTodo.todoId)?.labelId ?? null
    )
  }, [selectedTodo, todos])

  const selectLabel = useCallback(
    (labelId: string | null) => {
      if (!selectedTodo) return
      applyLabel(selectedTodo.todoId, labelId)
    },
    [selectedTodo, applyLabel]
  )

  return { selectedLabelId, selectLabel }
}

export { useTodoLabelSelection }
