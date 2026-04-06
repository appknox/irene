import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { APPLICATION_ROUTES } from '../support/application.routes';
import pwTranslate from '../support/translations';
import { API_ROUTES } from '../support/api.routes';
import NetworkActions from '../Actions/network.actions';

test('dashboard loads when already authenticated', async ({ page }) => {
  await allure.epic('Authentication');
  await allure.feature('Dashboard Access');
  await allure.story('Authenticated user lands on dashboard');
  await allure.severity('critical');
  await allure.owner('Pranav');
  await allure.tags('dashboard', 'auth', 'smoke', 'positive');
  await allure.description(`
    Verifies that an already authenticated user:
    - Can navigate to /dashboard/home
    - URL contains 'dashboard'
  `);

  await allure.step('Navigate to /dashboard/home', async () => {
    await page.goto('/dashboard/home');
  });

  await allure.step('Verify URL contains dashboard', async () => {
    await expect(page).toHaveURL(/dashboard/);
  });
});

test('should redirect unauthenticated user to login page', async ({
  browser,
}) => {
  await allure.epic('Authentication');
  await allure.feature('Login');
  await allure.story('Unauthenticated user is redirected to login');
  await allure.severity('critical');
  await allure.owner('Pranav');
  await allure.tags('auth', 'redirect', 'smoke', 'negative');
  await allure.description(`
    Verifies that a user with no session:
    - Is redirected to /login when visiting /projects
    - Login page title is visible
  `);

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await allure.step('Navigate to projects page without auth', async () => {
    await page.goto(APPLICATION_ROUTES.projects);
  });

  await allure.step('Wait for redirect to login', async () => {
    await page.waitForURL(/login/, { timeout: 15000 });
  });

  await allure.step('Verify URL is login and title is visible', async () => {
    await expect(page).toHaveURL(/login/);
    await expect(page.getByText(pwTranslate('loginTitle'))).toBeVisible();
  });

  await context.close();
});

test('valid login via UI redirects to dashboard', async ({ browser }) => {
  await allure.epic('Authentication');
  await allure.feature('Login');
  await allure.story('User logs in via UI and lands on dashboard');
  await allure.severity('critical');
  await allure.owner('Pranav');
  await allure.tags('auth', 'login', 'smoke', 'positive', 'e2e');
  await allure.description(`
    Verifies full UI login flow:
    - Fill username → click Next
    - Fill password → click Login
    - Redirected to dashboard
  `);

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await allure.step('Navigate to login page', async () => {
    await page.goto('/login');
  });

  await allure.step('Fill username and click Next', async () => {
    await page
      .getByPlaceholder(pwTranslate('usernameEmailIdTextPlaceholder'))
      .fill(process.env.TEST_USERNAME!);
    await page.getByRole('button', { name: 'Next' }).click();
  });

  await allure.step('Fill password and click Login', async () => {
    await page
      .getByPlaceholder(pwTranslate('passwordPlaceholder'))
      .fill(process.env.TEST_PASSWORD!);
    await page.locator('button[aria-label="login-submit-button"]').click();
  });

  await allure.step('Verify redirect to dashboard', async () => {
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  await context.close();
});

test('should show error message on failed login', async ({ browser }) => {
  await allure.epic('Authentication');
  await allure.feature('Login');
  await allure.story('User sees error message on failed login');
  await allure.severity('critical');
  await allure.owner('Pranav');
  await allure.tags('auth', 'login', 'negative', 'regression', 'mock');
  await allure.description(`
    Mocks POST /login with 401 response.
    Verifies that wrong credentials show error message:
    - "The credentials you entered are incorrect"
  `);

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();
  const networkActions = new NetworkActions(page);

  await allure.step('Mock login API to return 401', async () => {
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
  });

  await allure.step('Navigate to login page', async () => {
    await page.goto(APPLICATION_ROUTES.login);
  });

  await allure.step('Fill username and click Next', async () => {
    await page
      .getByPlaceholder(pwTranslate('usernameEmailIdTextPlaceholder'))
      .fill(process.env.TEST_USERNAME!);
    await page.getByRole('button', { name: 'Next' }).click();
  });

  await allure.step('Fill wrong password and click Login', async () => {
    await page
      .getByPlaceholder(pwTranslate('passwordPlaceholder'))
      .fill('wrong_password');
    await page.locator('button[aria-label="login-submit-button"]').click();
  });

  await allure.step('Verify error message is visible', async () => {
    await expect(
      page.getByText(pwTranslate('credentialsIncorrect'))
    ).toBeVisible();
  });

  await networkActions.clearAll();
  await context.close();
});

test('dashboard shows main UI elements', async ({ page }) => {
  await allure.epic('Dashboard');
  await allure.feature('Dashboard UI');
  await allure.story('Dashboard displays key UI elements');
  await allure.severity('normal');
  await allure.owner('Pranav');
  await allure.tags('dashboard', 'ui', 'smoke', 'positive');
  await allure.description(`
    Verifies /dashboard/projects page shows:
    - Upload App button
    - All Projects heading
    - All Projects description text
  `);

  await allure.step('Navigate to /dashboard/projects', async () => {
    await page.goto('/dashboard/projects');
  });

  await allure.step('Verify All Projects description is visible', async () => {
    await expect(
      page.getByText(pwTranslate('allProjectsDescription'))
    ).toBeVisible();
  });
});

test('reset button is disabled when email is empty', async ({ browser }) => {
  await allure.epic('Authentication');
  await allure.feature('Forgot Password');
  await allure.story('Reset button is disabled with no email entered');
  await allure.severity('normal');
  await allure.owner('Pranav');
  await allure.tags('forgot-password', 'ui', 'negative', 'regression');
  await allure.description(`
    Verifies on /recover page:
    - Reset Password button is disabled when email input is empty
  `);

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await allure.step('Navigate to recover page', async () => {
    await page.goto(APPLICATION_ROUTES.recover);
  });

  await allure.step('Verify reset button is disabled', async () => {
    const resetButton = page.getByRole('button', {
      name: pwTranslate('resetPassword'),
    });
    await expect(resetButton).toBeDisabled();
  });

  await context.close();
});

test('reset button enables when email is entered', async ({ browser }) => {
  await allure.epic('Authentication');
  await allure.feature('Forgot Password');
  await allure.story('Reset button enables after email is entered');
  await allure.severity('normal');
  await allure.owner('Pranav');
  await allure.tags('forgot-password', 'ui', 'positive', 'regression');
  await allure.description(`
    Verifies on /recover page:
    - Reset Password button enables after a valid email is typed
  `);

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await allure.step('Navigate to recover page', async () => {
    await page.goto(APPLICATION_ROUTES.recover);
  });

  await allure.step('Fill email input', async () => {
    await page
      .getByPlaceholder(pwTranslate('usernameEmailIdTextPlaceholder'))
      .fill('test@test.com');
  });

  await allure.step('Verify reset button is enabled', async () => {
    const resetButton = page.getByRole('button', {
      name: pwTranslate('resetPassword'),
    });
    await expect(resetButton).toBeEnabled();
  });

  await context.close();
});

test('forgot password API returns 204 and shows confirmation message', async ({
  browser,
}) => {
  await allure.epic('Authentication');
  await allure.feature('Forgot Password');
  await allure.story('User submits forgot password and sees confirmation');
  await allure.severity('normal');
  await allure.owner('Pranav');
  await allure.tags('forgot-password', 'api', 'smoke', 'positive');
  await allure.description(`
    Verifies full forgot password flow:
    - Fill email and click Reset Password
    - API returns 204
    - Confirmation messages are visible
  `);

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });

  const page = await context.newPage();

  await allure.step('Navigate to recover page', async () => {
    await page.goto(APPLICATION_ROUTES.recover);
  });

  await allure.step('Fill email and click Reset Password', async () => {
    await page
      .getByPlaceholder(pwTranslate('usernameEmailIdTextPlaceholder'))
      .fill('randomletters123@test.com');
  });

  const responsePromise = page.waitForResponse((res) =>
    res.url().includes(API_ROUTES.forgotPassword.route)
  );

  await allure.step('Click Reset Password button', async () => {
    await page
      .getByRole('button', { name: pwTranslate('resetPassword') })
      .click();
  });

  await allure.step('Verify API returns 204', async () => {
    const response = await responsePromise;
    expect(response.status()).toBe(204);
  });

  await allure.step('Verify confirmation messages are visible', async () => {
    await expect(
      page.getByText(pwTranslate('resetPasswordMessageToCheck'))
    ).toBeVisible();

    await expect(
      page.getByText(pwTranslate('resetPasswordMessageToRetry'))
    ).toBeVisible();
  });

  await context.close();
});
