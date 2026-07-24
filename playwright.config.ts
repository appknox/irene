// import { defineConfig } from '@playwright/test';
// import dotenv from 'dotenv';
// import path from 'path';

// const env = process.env.TEST_ENV || 'qa' || 'prod';

// dotenv.config({
//   path: path.resolve(__dirname, `.env.${env}`),
// });

// export default defineConfig({
//   testDir: './playwright/specs',
//   fullyParallel: true,
//   retries: process.env.CI ? 1 : 1,
//   workers: process.env.CI ? 4 : 2,
//   globalSetup: './playwright/global.setup.ts',
//   reporter: [
//     ['html', { open: 'never' }],
//     ['line'],
//     [
//       'allure-playwright',
//       {
//         detail: true,
//         outputFolder: 'allure-results',
//         suiteTitle: true,
//         environmentInfo: {
//           Environment: process.env.ENVIRONMENT || env.toUpperCase(),
//           BaseURL: process.env.BASE_URL,
//           Platform: process.platform,
//         },
//       },
//     ],
//   ],

//   use: {
//     baseURL: process.env.BASE_URL,
//     viewport: { width: 1450, height: 1650 },
//     testIdAttribute: 'data-test-cy',
//     // storageState: '.auth/user.json',
//     trace: 'on-first-retry',
//     screenshot: 'only-on-failure',
//     video: 'retain-on-failure',
//     actionTimeout: 10000,
//     navigationTimeout: 60000,
//   },
// });
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const env = process.env.TEST_ENV || 'qa';

dotenv.config({
  path: path.resolve(__dirname, `.env.${env}`),
});

export default defineConfig({
  testDir: './playwright/specs',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 1,
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
          Environment: process.env.ENVIRONMENT || env.toUpperCase(),
          BaseURL: process.env.BASE_URL,
          Platform: process.platform,
        },
      },
    ],
  ],

  projects: [
    {
      name: 'api',
      testMatch: '**/api/*.spec.ts',
      use: {
        baseURL: process.env.BASE_URL,
        viewport: { width: 1450, height: 1650 },
        testIdAttribute: 'data-test-cy',
        actionTimeout: 10000,
        navigationTimeout: 60000,
      },
    },
    {
      name: 'ui-setup',
      testMatch: '**/ui.setup.spec.ts',
      use: {
        baseURL: process.env.BASE_URL,
      },
    },
    {
      name: 'ui',
      testMatch: '**/specs/*.spec.ts',
      dependencies: ['ui-setup'],
      use: {
        baseURL: process.env.BASE_URL,
        viewport: { width: 1450, height: 1650 },
        testIdAttribute: 'data-test-cy',
        storageState: '.auth/user.json',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000,
        navigationTimeout: 60000,
      },
    },
  ],
});
