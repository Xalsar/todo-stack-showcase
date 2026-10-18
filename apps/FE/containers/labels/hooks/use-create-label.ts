"use client"

import { useState } from "react"
import { toast } from "sonner"

import { postLabels } from "@/src/lib/api/generated/client"
import type { Label } from "@/src/lib/api/generated/model"

import { LabelNameConflictError } from "../label-errors"
import { useLabels } from "./use-labels"

type CreateLabelOptions = {
  /**
   * Skip the optimistic list insert (default: true). When false, the caller
   * is responsible for adding the created label via `revealLabel`.
   */
  reveal?: boolean
}

function useCreateLabel() {
  const { data: labels, mutate } = useLabels()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)

  const exists = (name: string) =>
    (labels ?? []).some(
      (label) => label.name.toLowerCase() === name.toLowerCase()
    )

  const revealLabel = (label: Label) =>
    mutate((current) => [...(current ?? []), label], { revalidate: false })

  const onCreate = async (
    name: string,
    { reveal = true }: CreateLabelOptions = {}
  ): Promise<Label | null> => {
    setFailed(false)

    if (exists(name)) {
      throw new LabelNameConflictError(name)
    }

    setIsSubmitting(true)
    const optimistic: Label = {
      id: `optimistic-${name}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      if (reveal) {
        await mutate((current) => [...(current ?? []), optimistic], {
          revalidate: false,
        })
      }
      const created = await postLabels({ name })
      if (reveal) {
        await mutate(
          (current) =>
            (current ?? []).map((label) =>
              label.id === optimistic.id ? created : label
            ),
          { revalidate: false }
        )
      }
      return created
    } catch {
      setFailed(true)
      if (reveal) {
        await mutate(
          (current) =>
            (current ?? []).filter((label) => label.id !== optimistic.id),
          { revalidate: false }
        )
      }
      toast.error("Failed to create label. Is the backend running?")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  return { onCreate, revealLabel, isSubmitting, failed }
}

export { useCreateLabel }
