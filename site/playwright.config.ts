import { defineConfig, devices } from '@playwright/test';

/**
 * NOOWE Site — Playwright Cross-Browser Testing Configuration
 *
 * Run all tests:     npx playwright test
 * Run with UI:       npx playwright test --ui
 * Run specific file: npx playwright test tests/smoke.spec.ts
 * Show report:       npx playwright show-report
 */
export default defineConfig({
  testDir: './tests',

  /* Maximum time one test can run */
  timeout: 30_000,

  /* Expect assertions timeout */
  expect: {
    timeout: 5_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Limit parallel workers on CI to avoid flakiness */
  workers: process.env.CI ? 1 : undefined,

  /* Reporters */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  /* Shared settings for all projects */
  use: {
    /* Base URL — matches Vite dev server */
    baseURL: process.env.BASE_URL || 'http://localhost:8080',

    /* Collect trace on first retry */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on first retry */
    video: 'on-first-retry',

    /* Default navigation timeout */
    navigationTimeout: 15_000,
  },

  /* Configure projects for cross-browser testing */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  /* Start Vite dev server before running tests */
  webServer: {
    command: 'npx vite --port 8080',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
