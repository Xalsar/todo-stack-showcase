import { Router } from "express"
import { z } from "zod"

import {
  CreateLabelSchema,
  LabelIdParamsSchema,
  LabelSchema,
  UpdateLabelSchema,
} from "../schemas/label.js"
import { registry } from "../schemas/todo.js"
import {
  createLabel,
  deleteLabel,
  listLabels,
  updateLabel,
} from "../services/labelService.js"

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

labelsRouter.get("/", async (req, res) => {
  const labels = await listLabels(req.userId as string)
  res.json(labels)
})

registry.registerPath({
  method: "post",
  path: "/labels",
  request: {
    body: {
      description: "Label to create",
      required: true,
      content: {
        "application/json": {
          schema: CreateLabelSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created label",
      content: {
        "application/json": {
          schema: LabelSchema,
        },
      },
    },
    409: {
      description: "A label with this name already exists",
    },
  },
})

labelsRouter.post("/", async (req, res) => {
  const parsed = CreateLabelSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.issues })
    return
  }

  const result = await createLabel(parsed.data, req.userId as string)
  if (!result.ok) {
    res.status(409).json({ error: "A label with this name already exists" })
    return
  }

  res.status(201).json(result.label)
})

registry.registerPath({
  method: "patch",
  path: "/labels/{id}",
  request: {
    params: LabelIdParamsSchema,
    body: {
      description: "New label name",
      required: true,
      content: {
        "application/json": {
          schema: UpdateLabelSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated label",
      content: {
        "application/json": {
          schema: LabelSchema,
        },
      },
    },
    404: {
      description: "Label not found",
    },
    409: {
      description: "A label with this name already exists",
    },
  },
})

labelsRouter.patch("/:id", async (req, res) => {
  const params = LabelIdParamsSchema.safeParse(req.params)
  const body = UpdateLabelSchema.safeParse(req.body)
  if (!params.success || !body.success) {
    res.status(400).json({
      errors: [
        ...(params.success ? [] : params.error.issues),
        ...(body.success ? [] : body.error.issues),
      ],
    })
    return
  }

  const result = await updateLabel(
    params.data.id,
    body.data,
    req.userId as string
  )
  if (!result.ok) {
    if (result.reason === "not-found") {
      res.status(404).json({ error: "Label not found" })
    } else {
      res.status(409).json({ error: "A label with this name already exists" })
    }
    return
  }

  res.json(result.label)
})

registry.registerPath({
  method: "delete",
  path: "/labels/{id}",
  request: {
    params: LabelIdParamsSchema,
  },
  responses: {
    204: {
      description: "Deleted label",
    },
    404: {
      description: "Label not found",
    },
  },
})

labelsRouter.delete("/:id", async (req, res) => {
  const params = LabelIdParamsSchema.safeParse(req.params)
  if (!params.success) {
    res.status(400).json({ errors: params.error.issues })
    return
  }

  const deleted = await deleteLabel(params.data.id, req.userId as string)
  if (!deleted) {
    res.status(404).json({ error: "Label not found" })
    return
  }

  res.status(204).end()
})
