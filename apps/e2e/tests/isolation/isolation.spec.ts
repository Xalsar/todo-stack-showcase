import { randomUUID } from "node:crypto"

import { request as playwrightRequest } from "@playwright/test"
import type { APIRequestContext } from "@playwright/test"

import { API_URL } from "../env"
import { expect, test } from "../fixtures"

type Todo = { id: string; title: string; done: boolean }

async function listTodos(context: APIRequestContext): Promise<Todo[]> {
  const response = await context.get("/todos")
  expect(response.status()).toBe(200)
  return (await response.json()) as Todo[]
}

test("anonymous requests to protected endpoints are rejected", async ({
  request,
}) => {
  expect((await request.get(`${API_URL}/todos`)).status()).toBe(401)
  expect((await request.get(`${API_URL}/labels`)).status()).toBe(401)
})

test("a forged session cookie is rejected", async () => {
  const forged = await playwrightRequest.newContext({
    baseURL: API_URL,
    storageState: {
      cookies: [
        {
          name: "better-auth.session_token",
          value: "forged.session-token-value",
          domain: "localhost",
          path: "/",
          expires: -1,
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
  })

  try {
    expect((await forged.get("/todos")).status()).toBe(401)
  } finally {
    await forged.dispose()
  }
})

test("user B cannot see any of user A's todos", async ({ asA, asB }) => {
  const aTodos = await listTodos(asA)
  const bTodos = await listTodos(asB)

  const aIds = new Set(aTodos.map((todo) => todo.id))
  expect(bTodos.some((todo) => aIds.has(todo.id))).toBe(false)

  expect(bTodos.map((todo) => todo.title)).toContain("B: pay rent")
  expect(bTodos.map((todo) => todo.title)).not.toContain("A: buy groceries")
})

test("user B cannot mutate user A's todo by id", async ({ asA, asB }) => {
  const target = (await listTodos(asA)).find(
    (todo) => todo.title === "A: buy groceries"
  )
  expect(target).toBeDefined()
  const id = target!.id

  expect(
    (await asB.patch(`/todos/${id}/done`, { data: { done: true } })).status()
  ).toBe(404)
  expect(
    (
      await asB.patch(`/todos/${id}/title`, { data: { title: "hijacked" } })
    ).status()
  ).toBe(404)
  expect(
    (
      await asB.patch(`/todos/${id}/label`, { data: { labelId: null } })
    ).status()
  ).toBe(404)
  expect((await asB.delete(`/todos/${id}`)).status()).toBe(404)

  const unchanged = (await listTodos(asA)).find((todo) => todo.id === id)
  expect(unchanged).toBeDefined()
  expect(unchanged!.title).toBe("A: buy groceries")
  expect(unchanged!.done).toBe(false)
})

test("a todo created by user B is invisible to user A", async ({
  asA,
  asB,
}) => {
  const title = `isolation ${randomUUID()}`

  const created = await asB.post("/todos", { data: { title } })
  expect(created.status()).toBe(201)

  expect((await listTodos(asB)).map((todo) => todo.title)).toContain(title)
  expect((await listTodos(asA)).map((todo) => todo.title)).not.toContain(title)
})
