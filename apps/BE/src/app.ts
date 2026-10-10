import cors from "cors"
import express from "express"

import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth.js"

import { labelsRouter } from "./routes/labels.js"
import { todosRouter } from "./routes/todos.js"
import { requireAuth } from "./middleware/requireAuth.js"

export const app = express()

export function getCorsOrigin(): string {
  return process.env.CORS_ORIGIN ?? "http://localhost:3000"
}

app.use(
  cors({
    origin: getCorsOrigin(),
    credentials: true,
  })
)

app.all("/api/auth/{*any}", toNodeHandler(auth))

app.use(express.json())
app.use("/todos", requireAuth, todosRouter)
app.use("/labels", requireAuth, labelsRouter)
