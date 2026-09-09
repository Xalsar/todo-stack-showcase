import cors from "cors"
import express from "express"

import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth.js"

import { labelsRouter } from "./routes/labels.js"
import { todosRouter } from "./routes/todos.js"

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
)

app.all("/api/auth/{*any}", toNodeHandler(auth))

app.use(express.json())
app.use("/todos", todosRouter)
app.use("/labels", labelsRouter)

const port = Number(process.env.PORT ?? 4000)

app.listen(port, () => {
  console.log(`BE listening on http://localhost:${port}`)
})
