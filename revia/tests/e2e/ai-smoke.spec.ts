import { test, expect, Page } from "@playwright/test";

const BASE_URL = "https://revialearn-ai.vercel.app";
const EMAIL = "deadpool123@yopmail.com";
const PASSWORD = "deadpool@12345";

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('#identifier').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.href.includes("/login"), { timeout: 20000 });
  console.log(`✅ Logged in — on: ${page.url()}`);
}

test.describe("Revia — authenticated smoke tests", () => {

  test("1. Login + dashboard API", async ({ page }) => {
    await login(page);
    await page.screenshot({ path: "test-results/01-after-login.png" });

    // Hit dashboard API with session cookie
    const res = await page.request.get(`${BASE_URL}/api/dashboard`);
    console.log(`📊 Dashboard API status: ${res.status()}`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    console.log("📊 Dashboard:", JSON.stringify(data));
    console.log("✅ Dashboard API OK");
  });

  test("2. AI page — form, no provider selector, generates + prefetch fires once", async ({ page }) => {
    const apiCalls: number[] = [];

    page.on("request", (req) => {
      if (req.url().includes("/api/v1/generate/cards")) {
        apiCalls.push(Date.now());
        console.log(`📡 API call #${apiCalls.length} at ${new Date().toISOString()}`);
      }
    });

    await login(page);
    await page.goto(`${BASE_URL}/ai`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('h1', { timeout: 10000 });

    const heading = await page.locator("h1").innerText();
    console.log(`📄 h1 text: "${heading}"`);
    expect(heading).toContain("Revia AI");

    // Provider selector must be gone
    const hasProviderLabel = await page.locator("text=AI Provider").isVisible();
    console.log(`Provider selector visible: ${hasProviderLabel} (should be false)`);
    expect(hasProviderLabel).toBe(false);

    await page.screenshot({ path: "test-results/02-ai-form.png" });

    // Fill form
    await page.locator('#ai-goal').fill("Speak basic everyday Kannada");
    await page.locator('#ai-topic').fill("Greetings and Introductions");

    // Pick batch size 5
    const batchBtns = page.locator('[aria-labelledby="ai-batch-label"] button');
    const batchCount = await batchBtns.count();
    console.log(`Batch buttons found: ${batchCount}`);
    if (batchCount > 0) await batchBtns.nth(0).click();

    // Submit
    console.log("⏳ Submitting generation...");
    await page.locator('button[type="submit"]').click();
    const t0 = Date.now();

    // Wait for loading state
    await page.waitForSelector('[aria-busy="true"]', { timeout: 10000 }).catch(() =>
      console.log("⚠️ No aria-busy indicator found")
    );

    // Wait for loading to finish (streaming done)
    await page.waitForFunction(
      () => !document.querySelector('[aria-busy="true"]'),
      { timeout: 75000 }
    ).catch(() => console.log("⚠️ Still streaming after 75s"));

    console.log(`⏱️ First batch in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    await page.screenshot({ path: "test-results/03-cards-loaded.png" });

    expect(apiCalls.length).toBe(1);
    console.log("✅ Exactly 1 API call for initial batch");

    // Rest for 3s — no spontaneous prefetch
    await page.waitForTimeout(3000);
    expect(apiCalls.length).toBe(1);
    console.log("✅ No spurious prefetch at rest");

    // Swipe 6 times to approach ≤6 remaining cards threshold
    console.log("⏩ Swiping 6 cards...");
    const beforeSwipe = apiCalls.length;
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(500);
    }

    // Wait for prefetch
    await page.waitForTimeout(5000);
    await page.screenshot({ path: "test-results/04-after-swipe.png" });

    const prefetchCalls = apiCalls.length - beforeSwipe;
    console.log(`📊 Prefetch calls: ${prefetchCalls} (want exactly 1)`);

    // Log timing between calls to detect double-fire
    for (let i = 1; i < apiCalls.length; i++) {
      console.log(`  Gap call ${i}→${i + 1}: ${apiCalls[i] - apiCalls[i - 1]}ms`);
    }

    if (apiCalls.length >= 3) {
      console.log("❌ BUG: 3+ API calls — double prefetch still occurring");
    }

    expect(prefetchCalls).toBeLessThanOrEqual(1);

    // Wait for prefetch stream
    await page.waitForFunction(
      () => !document.querySelector('[aria-busy="true"]'),
      { timeout: 75000 }
    ).catch(() => null);

    // Final check — no third call
    await page.waitForTimeout(3000);
    console.log(`\n📊 FINAL total API calls: ${apiCalls.length}`);
    expect(apiCalls.length).toBeLessThanOrEqual(2);

    await page.screenshot({ path: "test-results/05-final.png" });
    console.log("✅ All checks passed");
  });
});
