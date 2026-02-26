import { test, expect } from '@playwright/test';
import { APPLICATION_ROUTES } from '../cypress/support/application.routes';
import cyTranslate from '../cypress/support/translations';

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
  await expect(page.getByText(cyTranslate('loginTitle'))).toBeVisible();

  await context.close();
});

test('should show error message on failed login', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto('/login');

  await page
    .getByPlaceholder(cyTranslate('usernameEmailIdTextPlaceholder'))
    .fill('invalid_user_123');
  await page.getByRole('button', { name: 'Next' }).click();

  await page
    .getByPlaceholder(cyTranslate('passwordPlaceholder'))
    .fill('wrong_password');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(
    page.getByText(cyTranslate('credentialsIncorrect'))
  ).toBeVisible();

  await context.close();
});

test('valid login via UI redirects to dashboard', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto('/login');

  await page
    .getByPlaceholder(cyTranslate('usernameEmailIdTextPlaceholder'))
    .fill(process.env.TEST_USERNAME!);

  await page.getByRole('button', { name: 'Next' }).click();

  await page
    .getByPlaceholder(cyTranslate('passwordPlaceholder'))
    .fill(process.env.TEST_PASSWORD!);

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL(/dashboard/, { timeout: 15000 });

  await expect(page).toHaveURL(/dashboard/);

  await context.close();
});

test('dashboard shows main UI elements', async ({ page }) => {
  await page.goto('/dashboard/projects');

  // await expect(page.getByText(cyTranslate('startNewScan'))).toBeVisible();
  await expect(page.getByText(cyTranslate('uploadApp'))).toBeVisible();
  await expect(page.getByText(cyTranslate('allProjects'))).toBeVisible();
  await expect(
    page.getByText(cyTranslate('allProjectsDescription'))
  ).toBeVisible();
});

test('reset button is disabled when email is empty', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto('/recover');

  const resetButton = page.getByRole('button', {
    name: cyTranslate('resetPassword'),
  });

  await expect(resetButton).toBeDisabled();

  await context.close();
});

test('reset button enables when email is entered', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto('/recover');

  const input = page.getByPlaceholder(
    cyTranslate('usernameEmailIdTextPlaceholder')
  );
  const resetButton = page.getByRole('button', {
    name: cyTranslate('resetPassword'),
  });

  await input.fill('test@test.com');

  await expect(resetButton).toBeEnabled();

  await context.close();
});

test('forgot password API returns 204 and shows confirmation message', async ({
  browser,
}) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto('/recover');

  await page
    .getByPlaceholder(cyTranslate('usernameEmailIdTextPlaceholder'))
    .fill('randomletters123@test.com');

  const responsePromise = page.waitForResponse((res) =>
    res.url().includes('/api/v2/forgot_password')
  );

  await page
    .getByRole('button', { name: cyTranslate('resetPassword') })
    .click();

  const response = await responsePromise;

  expect(response.status()).toBe(204);

  await expect(
    page.getByText(cyTranslate('resetPasswordMessageToCheck'))
  ).toBeVisible();

  await expect(
    page.getByText(cyTranslate('resetPasswordMessageToRetry'))
  ).toBeVisible();
  await context.close();
});
