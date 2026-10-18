import { Prisma } from "@prisma/client"

import { prisma } from "../lib/prisma.js"
import type {
  CreateLabelDto,
  LabelDto,
  UpdateLabelDto,
} from "../schemas/label.js"

export async function listLabels(userId: string): Promise<LabelDto[]> {
  const labels = await prisma.label.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  })

  return labels.map(toLabelDto)
}

export type CreateLabelResult =
  { ok: true; label: LabelDto } | { ok: false; reason: "duplicate-name" }

export async function createLabel(
  input: CreateLabelDto,
  userId: string
): Promise<CreateLabelResult> {
  try {
    const label = await prisma.label.create({
      data: { name: input.name, userId },
    })

    return { ok: true, label: toLabelDto(label) }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, reason: "duplicate-name" }
    }
    throw error
  }
}

export type UpdateLabelResult =
  | { ok: true; label: LabelDto }
  | { ok: false; reason: "not-found" | "duplicate-name" }

export async function updateLabel(
  id: string,
  input: UpdateLabelDto,
  userId: string
): Promise<UpdateLabelResult> {
  try {
    const label = await prisma.label.update({
      where: { id, userId },
      data: { name: input.name },
    })

    return { ok: true, label: toLabelDto(label) }
  } catch (error) {
    if (isNotFoundError(error)) {
      return { ok: false, reason: "not-found" }
    }
    if (isUniqueConstraintError(error)) {
      return { ok: false, reason: "duplicate-name" }
    }
    throw error
  }
}

export async function deleteLabel(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.label.delete({ where: { id, userId } })

    return true
  } catch (error) {
    if (isNotFoundError(error)) {
      return false
    }
    throw error
  }
}

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  )
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

export function toLabelDto(label: {
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
