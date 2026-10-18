import { z } from "zod"

import { registry, TodoSchema } from "./todo.js"

export const LabelSchema = registry.register(
  "Label",
  z.object({
    id: z.uuid(),
    name: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
)

export const CreateLabelSchema = registry.register(
  "CreateLabel",
  z.object({
    name: z.string().min(1),
  })
)

export const CreatedTodoLabelSchema = registry.register(
  "CreatedTodoLabel",
  z.object({
    todo: TodoSchema,
    label: LabelSchema,
  })
)

export const UpdateLabelSchema = registry.register(
  "UpdateLabel",
  z.object({
    name: z.string().min(1),
  })
)

export const LabelIdParamsSchema = registry.register(
  "LabelIdParams",
  z.object({
    id: z.uuid(),
  })
)

export type LabelDto = z.infer<typeof LabelSchema>
export type CreateLabelDto = z.infer<typeof CreateLabelSchema>
export type CreatedTodoLabelDto = z.infer<typeof CreatedTodoLabelSchema>
export type UpdateLabelDto = z.infer<typeof UpdateLabelSchema>
export type LabelIdParams = z.infer<typeof LabelIdParamsSchema>
