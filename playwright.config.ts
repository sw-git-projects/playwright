import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 360000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'https://myezra-staging.ezra.com/',
    trace: 'on-first-retry',
    screenshot: { mode: "only-on-failure", fullPage: true },
    actionTimeout: 10000,
    navigationTimeout: 45000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        video: 'retain-on-failure',
      },
    },
  ],
});

