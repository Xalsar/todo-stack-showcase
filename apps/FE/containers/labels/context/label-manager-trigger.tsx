"use client"

import { Tags } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useLabelManager } from "./label-manager"

function LabelManagerTrigger() {
  const { openLabelManager } = useLabelManager()

  return (
    <Button variant="ghost" onClick={() => openLabelManager()}>
      <Tags />
      Labels
    </Button>
  )
}

export { LabelManagerTrigger }
