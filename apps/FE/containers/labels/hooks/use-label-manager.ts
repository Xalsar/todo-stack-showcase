"use client"

import { createContext, useContext } from "react"

type LabelManagerContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
  openDialog: () => void
  closeDialog: () => void
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
export type { LabelManagerContextValue }
