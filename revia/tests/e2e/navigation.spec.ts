import { expect, test } from "@playwright/test";

test.describe("Mobile navigation", () => {
  test("home redirects to practice", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/practice$/);
  });

  test("can navigate between main sections", async ({ page }) => {
    await page.goto("/practice");
    await expect(page.getByText("Tap to reveal").or(page.getByText("Loading cards..."))).toBeVisible();

    await page.getByRole("link", { name: "Decks" }).click();
    await expect(page).toHaveURL(/\/decks$/);
    await expect(page.getByRole("heading", { name: "Decks" })).toBeVisible();

    await page.getByRole("link", { name: "Explore" }).click();
    await expect(page).toHaveURL(/\/explore$/);
    await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();

    await page.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("link", { name: "Practice", exact: true }).click();
    await expect(page).toHaveURL(/\/practice$/);
    await expect(page.getByText("Tap to reveal").or(page.getByText("Loading cards..."))).toBeVisible();
  });
});
