import { expect, test } from "@playwright/test";

test.describe("Review flow", () => {
  test("shows cards to study or empty state", async ({ page }) => {
    await page.goto("/review");

    const tapToReveal = page.getByText("Tap to reveal");
    const emptyState = page.getByRole("heading", { name: "All caught up" });
    const loading = page.getByText("Loading cards...");

    await expect(tapToReveal.or(emptyState).or(loading)).toBeVisible({ timeout: 15_000 });
    await expect(loading).toBeHidden({ timeout: 15_000 });

    if (await tapToReveal.isVisible()) {
      await expect(page.getByText("Daily Review")).toBeVisible();
      await page.getByText("Tap to reveal").click();
      await expect(page.getByText("Back")).toBeVisible();
      await expect(page.getByText("Front").first()).toBeVisible();
      await expect(page.getByRole("button", { name: "1" })).toBeVisible();
    } else {
      await expect(emptyState).toBeVisible();
      await expect(page.getByRole("link", { name: /Browse decks/i })).toBeVisible();
    }
  });

  test("review uses the same full-screen card viewer as lessons", async ({ page }) => {
    await page.goto("/review");

    const tapToReveal = page.getByText("Tap to reveal");
    const emptyState = page.getByRole("heading", { name: "All caught up" });

    await expect(tapToReveal.or(emptyState)).toBeVisible({ timeout: 15_000 });

    if (await tapToReveal.isVisible()) {
      await expect(page.locator(".study-viewer")).toBeVisible();
      await expect(page.getByText("1 /")).toBeVisible();
      await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    }
  });
});
