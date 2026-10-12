"use client"

import { useState } from "react"
import { toast } from "sonner"

import { patchLabelsId } from "@/src/lib/api/generated/client"

import { LabelNameConflictError } from "../label-errors"
import { useLabels } from "./use-labels"

function useRenameLabel() {
  const { data: labels, mutate } = useLabels()
  const [renamingId, setRenamingId] = useState<string | null>(null)

  const onRename = async (id: string, name: string): Promise<boolean> => {
    const conflict = (labels ?? []).some(
      (label) =>
        label.id !== id && label.name.toLowerCase() === name.toLowerCase()
    )

    if (conflict) {
      throw new LabelNameConflictError(name)
    }

    const previousName = labels?.find((label) => label.id === id)?.name
    setRenamingId(id)

    try {
      await mutate(
        (current) =>
          current?.map((label) =>
            label.id === id ? { ...label, name } : label
          ),
        { revalidate: false }
      )
      const updated = await patchLabelsId(id, { name })
      await mutate(
        (current) =>
          current?.map((label) => (label.id === id ? updated : label)),
        { revalidate: false }
      )
      return true
    } catch {
      if (previousName !== undefined) {
        await mutate(
          (current) =>
            current?.map((label) =>
              label.id === id ? { ...label, name: previousName } : label
            ),
          { revalidate: false }
        )
      }
      toast.error("Failed to rename label. Is the backend running?")
      return false
    } finally {
      setRenamingId(null)
    }
  }

  return { onRename, renamingId }
}

export { useRenameLabel }
