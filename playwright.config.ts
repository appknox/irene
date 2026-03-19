import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '.env.qa'),
});

export default defineConfig({
  testDir: './playwright/specs',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : 2,
  globalSetup: './playwright/global.setup.ts',
  reporter: [
    ['html', { open: 'never' }],
    ['line'],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: true,
        environmentInfo: {
          Environment: process.env.ENVIRONMENT || 'QA',
          BaseURL: process.env.BASE_URL,
          Platform: process.platform,
        },
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    viewport: { width: 1450, height: 1650 },
    testIdAttribute: 'data-test-cy', // Use the same data attribute for test selectors as in Cypress for consistency
    storageState: '.auth/user.json', // Store auth state in a separate file to avoid conflicts with any other storage needs
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
