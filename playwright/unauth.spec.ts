// import { test, expect } from '@playwright/test';
// import { APPLICATION_ROUTES } from '../cypress/support/application.routes';

// test('should redirect unauthenticated user to login page', async ({
//   browser,
// }) => {
//   // Create completely clean context
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   await page.goto(APPLICATION_ROUTES.projects);
//   await expect(page).toHaveURL(/login/);

//   await expect(page.getByText('Login to your account')).toBeVisible();

//   await context.close();
// });
import { test, expect } from '@playwright/test';
import { APPLICATION_ROUTES } from '../cypress/support/application.routes';


