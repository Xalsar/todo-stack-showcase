"use client"

import { Tags } from "lucide-react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/src/lib/auth-client"

import { useLabelManager } from "./label-manager"

function LabelManagerTrigger() {
  const { data } = authClient.useSession()
  const openLabelManager = useLabelManager((state) => state.openLabelManager)

  if (!data) {
    return null
  }

  return (
    <Button variant="ghost" onClick={() => openLabelManager()}>
      <Tags />
      Labels
    </Button>
  )
}

export { LabelManagerTrigger }
