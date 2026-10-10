import { randomUUID } from "node:crypto"

import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

const uniqueTitle = (label: string) => `${label} ${randomUUID()}`

function todoRow(page: Page, title: string) {
  return page
    .getByRole("listitem")
    .filter({ has: page.getByRole("button", { name: title }) })
}

async function createTodo(page: Page, title: string) {
  await page.getByPlaceholder("Add a todo…").fill(title)
  await page.getByRole("button", { name: "Add todo" }).click()

  const row = todoRow(page, title)
  await expect(row).toBeVisible()
  return row
}

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("read: seeded todo renders a row with all controls", async ({ page }) => {
  const row = todoRow(page, "A: buy groceries")

  await expect(row).toBeVisible()
  await expect(row.getByRole("button", { name: "Mark as done" })).toBeVisible()
  await expect(row.getByRole("button", { name: "Edit todo" })).toBeVisible()
  await expect(row.getByRole("button", { name: "View labels" })).toBeVisible()
  await expect(row.getByRole("button", { name: "Delete todo" })).toBeVisible()
})

test("create: adds a todo that persists across reload", async ({ page }) => {
  const title = uniqueTitle("create")
  const row = await createTodo(page, title)

  await page.reload()
  await expect(row).toBeVisible()
})

test("toggle: marks done and persists across reload", async ({ page }) => {
  const title = uniqueTitle("toggle")
  const row = await createTodo(page, title)

  await row.getByRole("button", { name: "Mark as done" }).click()

  const doneToggle = row.getByRole("button", { name: "Mark as not done" })
  await expect(doneToggle).toHaveAttribute("aria-pressed", "true")

  await page.reload()
  await expect(
    todoRow(page, title).getByRole("button", { name: "Mark as not done" })
  ).toHaveAttribute("aria-pressed", "true")
})

test("edit: renames a todo and persists across reload", async ({ page }) => {
  const original = uniqueTitle("edit-before")
  const updated = uniqueTitle("edit-after")
  const row = await createTodo(page, original)

  await row.getByRole("button", { name: "Edit todo" }).click()
  await page.getByLabel("Edit todo title").fill(updated)
  await page.getByRole("button", { name: "Save todo" }).click()

  await expect(todoRow(page, updated)).toBeVisible()
  await expect(page.getByRole("button", { name: original })).toHaveCount(0)

  await page.reload()
  await expect(todoRow(page, updated)).toBeVisible()
  await expect(page.getByRole("button", { name: original })).toHaveCount(0)
})

test("label: assigns a label and persists across reload", async ({ page }) => {
  const title = uniqueTitle("label")
  const row = await createTodo(page, title)

  await row.getByRole("button", { name: "View labels" }).click()
  await page.getByRole("menuitem", { name: "Work" }).click()

  await expect(row).toContainText("Work")

  await page.reload()
  await expect(todoRow(page, title)).toContainText("Work")
})

test("delete: removes a todo and stays gone after reload", async ({ page }) => {
  const title = uniqueTitle("delete")
  const row = await createTodo(page, title)

  await row.getByRole("button", { name: "Delete todo" }).click()

  await expect(todoRow(page, title)).toHaveCount(0)

  await page.reload()
  await expect(todoRow(page, title)).toHaveCount(0)
})

test("validation: empty title is rejected and creates nothing", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add todo" }).click()

  await expect(page.getByText("Title is required")).toBeVisible()
  await expect(page.getByPlaceholder("Add a todo…")).toHaveValue("")
})
