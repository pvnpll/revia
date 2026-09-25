import { expect, test } from "@playwright/test";

test.describe("Decks", () => {
  test("lists decks and opens deck detail", async ({ page }) => {
    await page.goto("/decks");
    await expect(page.getByRole("heading", { name: "Decks" })).toBeVisible();

    const deckLink = page.locator('a[href^="/decks/"]').first();
    await expect(deckLink).toBeVisible({ timeout: 15_000 });

    const href = await deckLink.getAttribute("href");
    expect(href).toMatch(/^\/decks\/[0-9a-f-]+$/);

    await deckLink.click();
    await expect(page).toHaveURL(href!);
    await expect(page.getByText("Lessons", { exact: true })).toBeVisible();
    await expect(page.getByText("Tap a lesson to study cards with swipe navigation.")).toBeVisible();
  });
});
