import { expect, test } from "@playwright/test";

test.describe("Mobile navigation", () => {
  test("home redirects to dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("can navigate between main sections", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("link", { name: "Decks" }).click();
    await expect(page).toHaveURL(/\/decks$/);
    await expect(page.getByRole("heading", { name: "Decks" })).toBeVisible();

    await page.getByRole("link", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();

    await page.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("link", { name: "Review", exact: true }).click();
    await expect(page).toHaveURL(/\/review$/);
    await expect(
      page.getByText("Daily Review").or(page.getByRole("heading", { name: "All caught up" })),
    ).toBeVisible();
  });
});
