import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '.env.qa'),
});

export default defineConfig({
  testDir: './playwright',
  use: {
    baseURL: process.env.BASE_URL,
    viewport: { width: 1450, height: 1650 },
    storageState: 'auth.json',
  },
});
