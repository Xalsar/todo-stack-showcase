"use client"

import { useCallback, useState } from "react"

function useMutatingTodos() {
  const [mutatingIds, setMutatingIds] = useState<Set<string>>(() => new Set())

  const setMutating = useCallback((id: string, on: boolean) => {
    setMutatingIds((current) => {
      const next = new Set(current)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const isMutating = useCallback(
    (id: string) => mutatingIds.has(id),
    [mutatingIds]
  )

  return { setMutating, isMutating }
}

export { useMutatingTodos }
