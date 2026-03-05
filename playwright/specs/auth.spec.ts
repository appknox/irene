import { test, expect } from '@playwright/test';
import { APPLICATION_ROUTES } from '../support/application.routes';
import pwTranslate from '../support/translations';
import { API_ROUTES } from '../support/api.routes';
import NetworkActions from '../Actions/network.actions';

test('dashboard loads when already authenticated', async ({ page }) => {
  await page.goto('/dashboard/home');
  await expect(page).toHaveURL(/dashboard/);
});

test('should redirect unauthenticated user to login page', async ({
  browser,
}) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto(APPLICATION_ROUTES.projects);
  await page.waitForURL(/login/, { timeout: 15000 });

  await expect(page).toHaveURL(/login/);
  await expect(page.getByText(pwTranslate('loginTitle'))).toBeVisible();

  await context.close();
});

test('valid login via UI redirects to dashboard', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto('/login');

  await page
    .getByPlaceholder(pwTranslate('usernameEmailIdTextPlaceholder'))
    .fill(process.env.TEST_USERNAME!);

  await page.getByRole('button', { name: 'Next' }).click();
  await page
    .getByPlaceholder(pwTranslate('passwordPlaceholder'))
    .fill(process.env.TEST_PASSWORD!);

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL(/dashboard/, { timeout: 15000 });
  await expect(page).toHaveURL(/dashboard/);

  await context.close();
});

test('should show error message on failed login', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();
  const networkActions = new NetworkActions(page);

  await networkActions.mockNetworkReq({
    method: 'POST',
    route: API_ROUTES.login.route,
    status: 401,
    dataOverride: {
      message: 'The credentials you entered are incorrect',
      attempt_left: '4',
      failure_limit: '5',
    },
  });

  await page.goto(APPLICATION_ROUTES.login);

  await page
    .getByPlaceholder(pwTranslate('usernameEmailIdTextPlaceholder'))
    .fill(process.env.TEST_USERNAME!);

  await page.getByRole('button', { name: 'Next' }).click();

  await page
    .getByPlaceholder(pwTranslate('passwordPlaceholder'))
    .fill('wrong_password');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(
    page.getByText(pwTranslate('credentialsIncorrect'))
  ).toBeVisible();

  await networkActions.clearAll();
  await context.close();
});

test('dashboard shows main UI elements', async ({ page }) => {
  await page.goto('/dashboard/projects');

  await expect(page.getByText(pwTranslate('uploadApp'))).toBeVisible();
  await expect(page.getByText(pwTranslate('allProjects'))).toBeVisible();
  await expect(
    page.getByText(pwTranslate('allProjectsDescription'))
  ).toBeVisible();
});

test('reset button is disabled when email is empty', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto(APPLICATION_ROUTES.recover);

  const resetButton = page.getByRole('button', {
    name: pwTranslate('resetPassword'),
  });

  await expect(resetButton).toBeDisabled();

  await context.close();
});

test('reset button enables when email is entered', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await page.goto(APPLICATION_ROUTES.recover);

  const input = page.getByPlaceholder(
    pwTranslate('usernameEmailIdTextPlaceholder')
  );

  const resetButton = page.getByRole('button', {
    name: pwTranslate('resetPassword'),
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

  await page.goto(APPLICATION_ROUTES.recover);

  await page
    .getByPlaceholder(pwTranslate('usernameEmailIdTextPlaceholder'))
    .fill('randomletters123@test.com');

  const responsePromise = page.waitForResponse((res) =>
    res.url().includes(API_ROUTES.forgotPassword.route)
  );

  await page
    .getByRole('button', { name: pwTranslate('resetPassword') })
    .click();

  const response = await responsePromise;
  expect(response.status()).toBe(204);

  await expect(
    page.getByText(pwTranslate('resetPasswordMessageToCheck'))
  ).toBeVisible();

  await expect(
    page.getByText(pwTranslate('resetPasswordMessageToRetry'))
  ).toBeVisible();

  await context.close();
});
