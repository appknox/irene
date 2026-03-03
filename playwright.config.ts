// import { defineConfig } from '@playwright/test';
// import dotenv from 'dotenv';
// import path from 'path';

// dotenv.config({
//   path: path.resolve(__dirname, '.env.qa'),
// });

// export default defineConfig({
//   testDir: './playwright',

//   use: {
//     baseURL: process.env.BASE_URL,
//     viewport: { width: 1450, height: 1650 },
//     storageState: 'auth.json',
//   },
// });
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
  reporter: [['html', { open: 'never' }], ['line']],

  use: {
    baseURL: process.env.BASE_URL,
    viewport: { width: 1450, height: 1650 },
    storageState: '.auth/user.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
