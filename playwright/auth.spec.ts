import { test, expect } from '@playwright/test';
import { skip } from 'qunit';
import { APPLICATION_ROUTES } from '../cypress/support/application.routes';

test('dashboard loads when already authenticated', async ({ page }) => {
  await page.goto('/dashboard/home');

  await expect(page).toHaveURL(/dashboard/);
});

test('should redirect unauthenticated user to login page', async ({
  browser,
}) => {
  // Explicitly empty storage to guarantee no auth state bleeds in
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto(APPLICATION_ROUTES.projects);

  // Wait for the redirect to complete before asserting
  await page.waitForURL(/login/, { timeout: 15000 });

  await expect(page).toHaveURL(/login/);
  await expect(page.getByText('Login to your account')).toBeVisible();

  await context.close();
});
