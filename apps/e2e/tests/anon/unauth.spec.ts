import { expect, test } from "@playwright/test"

import { API_URL } from "../env"

const TODO_ID = "00000000-0000-4000-8000-000000000000"

test("anonymous requests to protected endpoints are rejected", async ({
  request,
}) => {
  const todos = await request.get(`${API_URL}/todos`)
  expect(todos.status()).toBe(401)

  const labels = await request.get(`${API_URL}/labels`)
  expect(labels.status()).toBe(401)
})

test("anonymous mutation requests to /todos are rejected", async ({
  request,
}) => {
  const create = await request.post(`${API_URL}/todos`, {
    data: { title: "anon" },
  })
  expect(create.status()).toBe(401)

  const setDone = await request.patch(`${API_URL}/todos/${TODO_ID}/done`, {
    data: { done: true },
  })
  expect(setDone.status()).toBe(401)

  const setTitle = await request.patch(`${API_URL}/todos/${TODO_ID}/title`, {
    data: { title: "x" },
  })
  expect(setTitle.status()).toBe(401)

  const setLabel = await request.patch(`${API_URL}/todos/${TODO_ID}/label`, {
    data: { labelId: null },
  })
  expect(setLabel.status()).toBe(401)

  const remove = await request.delete(`${API_URL}/todos/${TODO_ID}`)
  expect(remove.status()).toBe(401)
})
