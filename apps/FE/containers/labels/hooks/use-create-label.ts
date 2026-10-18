"use client"

import { useState } from "react"
import { toast } from "sonner"

import {
  postLabels,
  postTodosIdLabel,
  useGetTodos,
} from "@/src/lib/api/generated/client"
import type { Label } from "@/src/lib/api/generated/model"

import { LabelNameConflictError } from "../label-errors"
import { useLabels } from "./use-labels"

type CreateLabelOptions = {
  todoId?: string
}

function useCreateLabel() {
  const { data: labels, mutate } = useLabels()
  const { mutate: mutateTodos } = useGetTodos()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)

  const exists = (name: string) =>
    (labels ?? []).some(
      (label) => label.name.toLowerCase() === name.toLowerCase()
    )

  const onCreate = async (
    name: string,
    { todoId }: CreateLabelOptions = {}
  ): Promise<Label | null> => {
    setFailed(false)

    if (exists(name)) {
      throw new LabelNameConflictError(name)
    }

    setIsSubmitting(true)
    try {
      if (todoId === undefined) {
        const created = await postLabels({ name })
        await mutate((current) => [...(current ?? []), created], {
          revalidate: false,
        })
        return created
      }

      const { todo: updated, label: created } = await postTodosIdLabel(todoId, {
        name,
      })

      mutate((current) => [...(current ?? []), created], { revalidate: false })
      mutateTodos(
        (current) =>
          current?.map((todo) => (todo.id === updated.id ? updated : todo)),
        { revalidate: false }
      )
      return created
    } catch {
      setFailed(true)
      toast.error("Failed to create label. Is the backend running?")
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  return { onCreate, isSubmitting, failed }
}

export { useCreateLabel }
