import { prisma } from "../lib/prisma.js"
import type { LabelDto } from "../schemas/label.js"

export async function listLabels(): Promise<LabelDto[]> {
  const labels = await prisma.label.findMany({ orderBy: { name: "asc" } })

  return labels.map(toDto)
}

function toDto(label: {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}): LabelDto {
  return {
    id: label.id,
    name: label.name,
    createdAt: label.createdAt.toISOString(),
    updatedAt: label.updatedAt.toISOString(),
  }
}
