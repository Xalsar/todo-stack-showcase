"use client"

import { Tags } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useLabelManager } from "./hooks/use-label-manager"

function LabelManagerTrigger() {
  const { openDialog } = useLabelManager()

  return (
    <Button variant="ghost" onClick={openDialog}>
      <Tags />
      Labels
    </Button>
  )
}

export { LabelManagerTrigger }
