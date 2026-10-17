import { randomUUID } from "node:crypto"

import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

/**
 * Generate a unique title for test data to avoid conflicts in parallel tests
 */
export const uniqueTitle = (label: string): string => `${label} ${randomUUID()}`

/**
 * Get a todo row locator by title
 */
export function todoRow(page: Page, title: string) {
  return page
    .getByRole("listitem")
    .filter({ has: page.getByRole("button", { name: title }) })
}

/**
 * Create a new todo and return its row locator
 */
export async function createTodo(page: Page, title: string) {
  await page.getByPlaceholder("Add a todo…").fill(title)
  await page.getByRole("button", { name: "Add todo" }).click()

  const row = todoRow(page, title)
  await expect(row).toBeVisible()
  return row
}
