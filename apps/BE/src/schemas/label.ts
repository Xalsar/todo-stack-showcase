import { z } from "zod"

import { registry } from "./todo.js"

export const LabelSchema = registry.register(
  "Label",
  z.object({
    id: z.uuid(),
    name: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
)

export type LabelDto = z.infer<typeof LabelSchema>
