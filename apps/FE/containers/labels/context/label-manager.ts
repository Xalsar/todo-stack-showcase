"use client"

import { createContext, useContext } from "react"

type SelectedTodo = {
  todoId: string
}

type LabelManagerContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  openLabelManager: (selectedTodo?: SelectedTodo) => void
  closeLabelManager: () => void
  selectedTodo: SelectedTodo | null
}

const LabelManagerContext = createContext<LabelManagerContextValue | null>(null)

function useLabelManager() {
  const context = useContext(LabelManagerContext)

  if (!context) {
    throw new Error(
      "useLabelManager must be used within a LabelManagerProvider"
    )
  }

  return context
}

export { LabelManagerContext, useLabelManager }
export type { LabelManagerContextValue, SelectedTodo }
