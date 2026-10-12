"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"

import { LabelManager } from "./components/label-manager"
import {
  LabelManagerContext,
  type LabelManagerContextValue,
} from "./hooks/use-label-manager"

type LabelManagerProviderProps = {
  children: ReactNode
}

function LabelManagerProvider({ children }: LabelManagerProviderProps) {
  const [open, setOpen] = useState(false)

  const openDialog = useCallback(() => setOpen(true), [])
  const closeDialog = useCallback(() => setOpen(false), [])

  const value = useMemo<LabelManagerContextValue>(
    () => ({ open, onOpenChange: setOpen, openDialog, closeDialog }),
    [open, openDialog, closeDialog]
  )

  return (
    <LabelManagerContext.Provider value={value}>
      {children}
      <LabelManager />
    </LabelManagerContext.Provider>
  )
}

export { LabelManagerProvider }
