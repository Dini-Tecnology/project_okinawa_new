import { test, expect } from '@playwright/test';

test.describe('NOOWE Site — Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');

    // Verify successful HTTP response
    expect(response?.status()).toBeLessThan(400);

    // Verify the page title contains NOOWE
    await expect(page).toHaveTitle(/NOOWE/);

    // Verify the root element rendered content
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to fully render
    await page.waitForLoadState('networkidle');

    // Check that navigation links or buttons are present
    const navLinks = page.locator('nav a, nav button, header a, header button');
    const linkCount = await navLinks.count();

    // The site should have at least one navigable element
    expect(linkCount).toBeGreaterThan(0);

    // Click the first navigation link and verify no crash
    const firstLink = navLinks.first();
    const linkText = await firstLink.textContent();

    if (linkText) {
      await firstLink.click();
      // Page should still be loaded after navigation
      await page.waitForLoadState('domcontentloaded');
      const root = page.locator('#root');
      await expect(root).not.toBeEmpty();
    }
  });

  test('cookie consent banner appears', async ({ page }) => {
    // Clear any stored cookie preferences to force the banner to show
    await page.context().clearCookies();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for cookie consent elements (common selectors)
    const cookieBanner = page.locator(
      '[data-testid="cookie-consent"], ' +
      '[class*="cookie"], ' +
      '[class*="Cookie"], ' +
      '[class*="consent"], ' +
      '[role="dialog"][class*="cookie"], ' +
      'text=/cookie|Cookie|LGPD|privacidade/i'
    );

    // The cookie consent component should be visible
    await expect(cookieBanner.first()).toBeVisible({ timeout: 10_000 });
  });

  test('responsive layout — mobile viewport', async ({ browser }) => {
    // Create a context with mobile viewport dimensions (iPhone 14 Pro)
    const context = await browser.newContext({
      viewport: { width: 393, height: 852 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
        'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true,
    });

    const page = await context.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the page renders at mobile width without horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(393 + 1); // Allow 1px rounding tolerance

    // Verify main content is visible
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    // Check that content is vertically scrollable (mobile pages are usually taller)
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(bodyHeight).toBeGreaterThan(400);

    // Verify no content overflows horizontally
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalScroll).toBe(false);

    await context.close();
  });
});
