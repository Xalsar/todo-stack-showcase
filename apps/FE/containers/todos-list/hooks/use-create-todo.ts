"use client"

import { useState } from "react"

import { useGetTodos, usePostTodos } from "@/src/lib/api/generated/client"
import type { Todo } from "@/src/lib/api/generated/model"

function useCreateTodo() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)

  const { mutate } = useGetTodos()
  const { trigger: createTodo } = usePostTodos()

  const onSubmit = async (title: string): Promise<boolean> => {
    setFailed(false)
    setIsSubmitting(true)
    try {
      const created = await createTodo({ title }, { revalidate: false })
      await mutate(
        (current: Todo[] | undefined) => [created, ...(current ?? [])],
        { revalidate: false }
      )
      return true
    } catch {
      setFailed(true)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { onSubmit, isSubmitting, failed }
}

export { useCreateTodo }
