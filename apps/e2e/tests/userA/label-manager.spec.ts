import { expect, test } from "@playwright/test"

import { createTodo, todoRow, uniqueTitle } from "../support/todo-helpers"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test.describe("Label Manager", () => {
  test("opens Label Manager drawer from todo-item dropdown", async ({
    page,
  }) => {
    const title = uniqueTitle("lm-open")
    await createTodo(page, title)
    const row = todoRow(page, title)

    // Open label dropdown
    await row.getByRole("button", { name: "View labels" }).click()

    // Click "Manage labels…" to open drawer
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()

    // Verify drawer is open with correct title and description
    const drawer = page.getByRole("dialog")
    await expect(drawer).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Change label" })
    ).toBeVisible()
    await expect(page.getByText("Select a label for this todo.")).toBeVisible()
  })

  test("creates a new label and auto-applies it to the todo", async ({
    page,
  }) => {
    const todoTitle = uniqueTitle("lm-create")
    const labelName = uniqueTitle("test-label")
    await createTodo(page, todoTitle)
    const row = todoRow(page, todoTitle)

    // Open label dropdown and then label manager
    await row.getByRole("button", { name: "View labels" }).click()
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()

    // Wait for drawer to open
    await expect(
      page.getByRole("heading", { name: "Change label" })
    ).toBeVisible()

    // Create new label
    await page.getByLabel("New label").fill(labelName)
    await page.getByRole("button", { name: "Add label" }).click()

    // Verify the new label appears in the list
    await expect(page.getByRole("radio", { name: labelName })).toBeVisible()

    // Close the drawer
    await page.getByRole("button", { name: "Close" }).click()

    // Verify the todo row now displays the new label
    await expect(row).toContainText(labelName)

    // Reload and verify persistence
    await page.reload()
    await expect(todoRow(page, todoTitle)).toContainText(labelName)
  })

  test("renames a label and updates todo display", async ({ page }) => {
    const todoTitle = uniqueTitle("lm-rename")
    const originalLabel = uniqueTitle("rename-target")
    const renamedLabel = uniqueTitle("renamed")
    await createTodo(page, todoTitle)
    const row = todoRow(page, todoTitle)

    // Open label manager and create a unique label to rename
    await row.getByRole("button", { name: "View labels" }).click()
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()
    await expect(
      page.getByRole("heading", { name: "Change label" })
    ).toBeVisible()

    // Create the label (auto-applied to todo)
    await page.getByLabel("New label").fill(originalLabel)
    await page.getByRole("button", { name: "Add label" }).click()
    await expect(page.getByRole("radio", { name: originalLabel })).toBeVisible()

    // Click rename button for the label
    await page.getByRole("button", { name: `Rename ${originalLabel}` }).click()

    // Fill in the new name
    await page.getByLabel("Edit label name").fill(renamedLabel)
    await page.getByRole("button", { name: "Save label" }).click()

    // Verify the rename succeeded (new name appears in the list)
    await expect(page.getByRole("radio", { name: renamedLabel })).toBeVisible()

    // Close the drawer
    await page.getByRole("button", { name: "Close" }).click()

    // Verify the todo now displays the renamed label
    await expect(row).toContainText(renamedLabel)

    // Reload and verify persistence
    await page.reload()
    await expect(todoRow(page, todoTitle)).toContainText(renamedLabel)
  })

  test("deletes a label and removes it from todo", async ({ page }) => {
    const todoTitle = uniqueTitle("lm-delete")
    const labelName = uniqueTitle("delete-target")
    await createTodo(page, todoTitle)
    const row = todoRow(page, todoTitle)

    // Open label manager and create a unique label to delete
    await row.getByRole("button", { name: "View labels" }).click()
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()
    await expect(
      page.getByRole("heading", { name: "Change label" })
    ).toBeVisible()

    // Create the label (auto-applied to todo)
    await page.getByLabel("New label").fill(labelName)
    await page.getByRole("button", { name: "Add label" }).click()
    await expect(page.getByRole("radio", { name: labelName })).toBeVisible()

    // Close the drawer
    await page.getByRole("button", { name: "Close" }).click()

    // Verify the todo displays the label
    await expect(row).toContainText(labelName)

    // Open label manager again to delete the label
    await row.getByRole("button", { name: "View labels" }).click()
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()
    await expect(
      page.getByRole("heading", { name: "Change label" })
    ).toBeVisible()

    // Click delete button for the label
    await page.getByRole("button", { name: `Delete ${labelName}` }).click()

    // Confirm deletion in the dialog
    await page.getByRole("button", { name: "Delete label" }).click()

    // Verify the label is removed from the list
    await expect(page.getByRole("radio", { name: labelName })).toHaveCount(0)

    // Close the drawer
    await page.getByRole("button", { name: "Close" }).click()

    // Verify the todo no longer displays the label
    await expect(row).not.toContainText(labelName)

    // Reload and verify persistence
    await page.reload()
    await expect(todoRow(page, todoTitle)).not.toContainText(labelName)
  })

  test("closes Label Manager drawer via Close button", async ({ page }) => {
    const title = uniqueTitle("lm-close")
    await createTodo(page, title)
    const row = todoRow(page, title)

    // Open label dropdown and then label manager
    await row.getByRole("button", { name: "View labels" }).click()
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()

    // Verify drawer is open
    const drawer = page.getByRole("dialog")
    await expect(drawer).toBeVisible()

    // Click the Close button
    await page.getByRole("button", { name: "Close" }).click()

    // Verify drawer is closed
    await expect(drawer).toHaveCount(0)
  })

  test("validates empty label name is rejected", async ({ page }) => {
    const title = uniqueTitle("lm-empty")
    await createTodo(page, title)
    const row = todoRow(page, title)

    // Open label manager
    await row.getByRole("button", { name: "View labels" }).click()
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()

    // Wait for drawer to open
    await expect(
      page.getByRole("heading", { name: "Change label" })
    ).toBeVisible()

    // Leave input empty and click Add label
    await page.getByRole("button", { name: "Add label" }).click()

    // Verify validation message appears
    await expect(page.getByText("Name is required")).toBeVisible()
  })

  test("detects duplicate label name conflict", async ({ page }) => {
    const todoTitle = uniqueTitle("lm-dup")
    const labelName = uniqueTitle("duplicate-test")
    await createTodo(page, todoTitle)
    const row = todoRow(page, todoTitle)

    // Open label manager
    await row.getByRole("button", { name: "View labels" }).click()
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()

    // Wait for drawer to open
    await expect(
      page.getByRole("heading", { name: "Change label" })
    ).toBeVisible()

    // Create a label first
    await page.getByLabel("New label").fill(labelName)
    await page.getByRole("button", { name: "Add label" }).click()
    await expect(page.getByRole("radio", { name: labelName })).toBeVisible()

    // Try to create the same label again
    await page.getByLabel("New label").fill(labelName)
    await page.getByRole("button", { name: "Add label" }).click()

    // Verify error message appears
    await expect(
      page.getByText("A label with this name already exists")
    ).toBeVisible()
  })

  test("assigns existing label via Label Manager drawer", async ({ page }) => {
    const title = uniqueTitle("lm-assign")
    await createTodo(page, title)
    const row = todoRow(page, title)

    // Open label manager
    await row.getByRole("button", { name: "View labels" }).click()
    await page.getByRole("menuitem", { name: "Manage labels…" }).click()

    // Wait for drawer to open
    await expect(
      page.getByRole("heading", { name: "Change label" })
    ).toBeVisible()

    // Click on the "Work" radio button to select it
    await page.getByRole("radio", { name: "Work" }).click()

    // Verify the radio button is selected
    await expect(page.getByRole("radio", { name: "Work" })).toBeChecked()

    // Close the drawer
    await page.getByRole("button", { name: "Close" }).click()

    // Verify the todo row displays "Work"
    await expect(row).toContainText("Work")

    // Reload and verify persistence
    await page.reload()
    await expect(todoRow(page, title)).toContainText("Work")
  })
})
