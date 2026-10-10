import { expect, test } from "@playwright/test"

test("user B sees only their own todos", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByText("B: pay rent")).toBeVisible()
  await expect(page.getByText("A: buy groceries")).toHaveCount(0)
  await expect(page.getByText("A: walk the dog")).toHaveCount(0)
})
