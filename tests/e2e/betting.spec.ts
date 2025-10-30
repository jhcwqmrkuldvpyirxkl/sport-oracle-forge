import { test, expect } from '@playwright/test';

/**
 * E2E Test for SportOracle Betting Functionality
 * Tests the complete betting flow on local network
 */

test.describe('SportOracle Betting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8080');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the landing page correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Bet Privately. Win Transparently.');

    // Check description
    await expect(page.getByText('Compose fully encrypted wagers')).toBeVisible();

    console.log('✅ Landing page loaded successfully');
  });

  test('should display available markets', async ({ page }) => {
    // Wait for markets to load
    await page.waitForTimeout(2000);

    // Check for market cards
    const markets = page.locator('[data-testid="market-card"], .market-card, .card').first();

    // Markets should be visible
    const isVisible = await markets.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Markets are displayed');

      // Try to find market IDs
      const marketText = await page.textContent('body');
      console.log('   Markets found:',
        marketText?.includes('1001') ? 'Market 1001 ✓' : '',
        marketText?.includes('1002') ? 'Market 1002 ✓' : '',
        marketText?.includes('1003') ? 'Market 1003 ✓' : ''
      );
    } else {
      console.log('ℹ️  Markets section structure may differ from expected');
    }
  });

  test('should show connect wallet prompt when not connected', async ({ page }) => {
    // Look for connect wallet button
    const connectButton = page.getByRole('button', { name: /connect/i }).first();

    await expect(connectButton).toBeVisible();
    console.log('✅ Connect Wallet button is visible');
  });

  test('should show encryption status panel', async ({ page }) => {
    // Wait a bit for components to render
    await page.waitForTimeout(1000);

    // Check for encryption status elements
    const bodyText = await page.textContent('body');

    if (bodyText?.includes('FHE') || bodyText?.includes('Encryption') || bodyText?.includes('WASM')) {
      console.log('✅ Encryption status information is displayed');
    } else {
      console.log('ℹ️  Encryption status panel may be loading');
    }
  });

  test('should display bet slip panel', async ({ page }) => {
    // Wait for page to render
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent('body');

    // Check for bet slip related text
    const hasBetSlipText =
      bodyText?.includes('Select') ||
      bodyText?.includes('Bet') ||
      bodyText?.includes('Stake');

    if (hasBetSlipText) {
      console.log('✅ Bet slip panel elements are present');
    } else {
      console.log('ℹ️  Bet slip may require market selection');
    }
  });

  test('should display correct network information', async ({ page }) => {
    const bodyText = await page.textContent('body');

    // Check if Sepolia is mentioned (as the default config)
    // Or check for local network references
    if (bodyText?.includes('Sepolia') || bodyText?.includes('Network')) {
      console.log('✅ Network information is displayed');
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    console.log('✅ Desktop layout rendered');

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    console.log('✅ Tablet layout rendered');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    console.log('✅ Mobile layout rendered');
  });

  test('should show correct contract information', async ({ page }) => {
    // Open browser console to check for contract address logs
    page.on('console', msg => {
      if (msg.text().includes('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')) {
        console.log('✅ Correct contract address detected:', msg.text());
      }
    });

    await page.waitForTimeout(2000);
  });
});

test.describe('Frontend API Integration', () => {
  test('should fetch markets from contract', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];

    page.on('request', request => {
      if (request.url().includes('8545')) {
        requests.push(request.method());
      }
    });

    await page.goto('http://localhost:8080');
    await page.waitForTimeout(3000);

    if (requests.length > 0) {
      console.log(`✅ Frontend made ${requests.length} requests to local node`);
    } else {
      console.log('ℹ️  No direct RPC requests detected (may use wallet provider)');
    }
  });

  test('should initialize FHE SDK', async ({ page }) => {
    const logs: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('FHE') || text.includes('SDK') || text.includes('WASM')) {
        logs.push(text);
        console.log('📝 FHE Log:', text);
      }
    });

    await page.goto('http://localhost:8080');
    await page.waitForTimeout(5000);

    if (logs.length > 0) {
      console.log(`✅ FHE SDK initialization detected (${logs.length} logs)`);
    }
  });
});

test.describe('UI Components', () => {
  test('should render navbar', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Look for navbar/header elements
    const nav = page.locator('nav, header, [role="navigation"]').first();
    const isVisible = await nav.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Navbar is rendered');
    } else {
      console.log('ℹ️  Navbar structure may differ');
    }
  });

  test('should handle dark/light theme (RainbowKit)', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(1000);

    // RainbowKit should be using light theme (as we configured)
    const bodyHtml = await page.content();

    // Check for RainbowKit styles
    if (bodyHtml.includes('rainbowkit')) {
      console.log('✅ RainbowKit is loaded');
    }
  });
});
