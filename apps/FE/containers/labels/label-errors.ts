import { ApiError } from "@/src/lib/api/fetcher"

export class LabelNameConflictError extends Error {
  readonly status = 409

  constructor(name: string) {
    super(`A label named "${name}" already exists`)
    this.name = "LabelNameConflictError"
  }
}

export function isNameConflict(error: unknown): boolean {
  return (
    error instanceof LabelNameConflictError ||
    (error instanceof ApiError && error.status === 409)
  )
}
