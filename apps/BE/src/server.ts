import cors from "cors"
import express from "express"

import { labelsRouter } from "./routes/labels.js"
import { todosRouter } from "./routes/todos.js"

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  })
)
app.use(express.json())
app.use("/todos", todosRouter)
app.use("/labels", labelsRouter)

const port = Number(process.env.PORT ?? 4000)

app.listen(port, () => {
  console.log(`BE listening on http://localhost:${port}`)
})
