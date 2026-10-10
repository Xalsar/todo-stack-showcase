import { expect, test } from "@playwright/test"

test("authenticated user sees the app and their seeded todos", async ({
  page,
}) => {
  await page.goto("/")

  await expect(
    page.getByRole("button", { name: "Open user menu" })
  ).toBeVisible()
  await expect(page.getByText("A: buy groceries")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Sign in" })).toHaveCount(0)
})
