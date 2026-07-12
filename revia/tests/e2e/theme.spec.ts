import { expect, test } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("can switch between light and dark mode from settings", async ({ page }) => {
    await page.goto("/settings");

    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(html).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Switch to light mode" }).click();
    await expect(html).not.toHaveClass(/dark/);
  });
});
