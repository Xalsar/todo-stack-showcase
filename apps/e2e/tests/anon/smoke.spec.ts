import { expect, test } from "@playwright/test"

test("unauthenticated visitor is asked to sign in", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Continue with Google" })
  ).toBeVisible()

  await expect(page.getByPlaceholder("Add a todo…")).toHaveCount(0)
})
