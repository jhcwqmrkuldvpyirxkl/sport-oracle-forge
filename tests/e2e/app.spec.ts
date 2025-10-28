import { test, expect } from "@playwright/test";

const beforeEachSetup = (page: import("@playwright/test").Page) => {
  page.on("console", (message) => {
    console.log(`[browser:${message.type()}] ${message.text()}`);
  });
  page.on("pageerror", (error) => {
    console.error(`[browser:error] ${error.message}`);
  });
};

const navigate = async (page: import("@playwright/test").Page, path = "/") => {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.waitForLoadState("domcontentloaded");
};

test.describe("SportOracle experience", () => {
  test.beforeEach(async ({ page }) => {
    beforeEachSetup(page);
  });

  test("landing page communicates encrypted markets", async ({ page }) => {
    await navigate(page, "/");

    const heroHeading = page.locator("text=Predict the matchday. Keep your edge private.");
    await heroHeading.waitFor({ state: "visible" });
    await expect(page.getByRole("button", { name: /Launch Encrypted Console/i })).toBeVisible();

    const featureCards = page.locator("section#live h3");
    await expect(featureCards).toHaveCount(3);

    const cta = page.getByRole("button", { name: /Launch DApp/i });
    await expect(cta).toBeVisible();
  });

  test("dapp enforces wallet connection before encrypting", async ({ page }) => {
    await navigate(page, "/dapp");

    const marketCard = page.locator('[data-testid="market-card"]').first();
    await marketCard.waitFor({ state: "visible" });
    await marketCard.click();

    const betSlip = page.getByText(/Encrypted Bet Slip/i);
    await expect(betSlip).toBeVisible();

    const stakeInput = page.getByLabel(/Stake \(ETH\)/i);
    await stakeInput.fill("0.5");

    const placeButton = page.getByRole("button", { name: /Place Encrypted Bet/i });
    await placeButton.click();

    await expect(page.getByText(/Wallet required/i)).toBeVisible();
  });
});
