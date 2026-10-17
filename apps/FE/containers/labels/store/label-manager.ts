"use client"

import { create } from "zustand"

type SelectedTodo = {
  todoId: string
}

type LabelManagerState = {
  open: boolean
  selectedTodo: SelectedTodo | null
  openLabelManager: (selectedTodo?: SelectedTodo) => void
  closeLabelManager: () => void
  onOpenChange: (open: boolean) => void
}

const useLabelManager = create<LabelManagerState>((set) => ({
  open: false,
  selectedTodo: null,
  openLabelManager: (selectedTodo) =>
    set({ open: true, selectedTodo: selectedTodo ?? null }),
  closeLabelManager: () => set({ open: false }),
  onOpenChange: (open) => set({ open }),
}))

export { useLabelManager }
export type { LabelManagerState, SelectedTodo }
