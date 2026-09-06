"use client"

import { useGetLabels } from "@/src/lib/api/generated/client"

function useLabels() {
  return useGetLabels()
}

export { useLabels }
