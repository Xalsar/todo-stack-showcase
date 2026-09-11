import { prisma } from "../lib/prisma.js"
import type { LabelDto } from "../schemas/label.js"

export async function listLabels(userId: string): Promise<LabelDto[]> {
  const labels = await prisma.label.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  })

  return labels.map(toDto)
}

function toDto(label: {
  id: string
  name: string
  userId: string
  createdAt: Date
  updatedAt: Date
}): LabelDto {
  return {
    id: label.id,
    name: label.name,
    userId: label.userId,
    createdAt: label.createdAt.toISOString(),
    updatedAt: label.updatedAt.toISOString(),
  }
}
