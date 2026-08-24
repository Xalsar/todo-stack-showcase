import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi"
import { z } from "zod"

extendZodWithOpenApi(z)

export const registry = new OpenAPIRegistry()

export const TodoSchema = registry.register(
  "Todo",
  z.object({
    id: z.uuid(),
    title: z.string(),
    done: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
)

export const CreateTodoSchema = registry.register(
  "CreateTodo",
  z.object({
    title: z.string().min(1),
  })
)

export const SetTodoDoneSchema = registry.register(
  "SetTodoDone",
  z.object({
    done: z.boolean(),
  })
)

export const TodoIdParamsSchema = registry.register(
  "TodoIdParams",
  z.object({
    id: z.uuid(),
  })
)

export type TodoDto = z.infer<typeof TodoSchema>
export type CreateTodoDto = z.infer<typeof CreateTodoSchema>
export type SetTodoDoneDto = z.infer<typeof SetTodoDoneSchema>
export type TodoIdParams = z.infer<typeof TodoIdParamsSchema>
