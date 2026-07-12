import { expect, test } from "@playwright/test";

test.describe("API health", () => {
  test("health endpoint returns ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeTruthy();
  });

  test("dashboard API returns summary data", async ({ request }) => {
    const response = await request.get("/api/dashboard");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.data).toMatchObject({
      dueToday: expect.any(Number),
      reviewedToday: expect.any(Number),
      totalCards: expect.any(Number),
      deckCount: expect.any(Number),
    });
  });
});
