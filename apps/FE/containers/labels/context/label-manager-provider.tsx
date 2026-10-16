"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"

import { LabelManager } from "../label-manager"
import {
  LabelManagerContext,
  type LabelManagerContextValue,
  type SelectedTodo,
} from "./label-manager"

type LabelManagerProviderProps = {
  children: ReactNode
}

function LabelManagerProvider({ children }: LabelManagerProviderProps) {
  const [open, setOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<SelectedTodo | null>(null)

  const openLabelManager = useCallback((nextSelectedTodo?: SelectedTodo) => {
    setSelectedTodo(nextSelectedTodo ?? null)
    setOpen(true)
  }, [])
  const closeLabelManager = useCallback(() => setOpen(false), [])

  const value = useMemo<LabelManagerContextValue>(
    () => ({
      open,
      onOpenChange: setOpen,
      openLabelManager,
      closeLabelManager,
      selectedTodo,
    }),
    [open, openLabelManager, closeLabelManager, selectedTodo]
  )

  return (
    <LabelManagerContext.Provider value={value}>
      {children}
      <LabelManager />
    </LabelManagerContext.Provider>
  )
}

export { LabelManagerProvider }
