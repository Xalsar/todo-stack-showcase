import { Router } from "express"
import { z } from "zod"

import { LabelSchema } from "../schemas/label.js"
import { registry } from "../schemas/todo.js"
import { listLabels } from "../services/labelService.js"

export const labelsRouter = Router()

registry.registerPath({
  method: "get",
  path: "/labels",
  responses: {
    200: {
      description: "List of labels",
      content: {
        "application/json": {
          schema: z.array(LabelSchema),
        },
      },
    },
  },
})

labelsRouter.get("/", async (_req, res) => {
  const labels = await listLabels()
  res.json(labels)
})
