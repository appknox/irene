import { test, expect } from '@playwright/test';
import loginActions from '../Actions/loginActions';

test('generate auth session', async ({ page }) => {
  const login = new loginActions(page);

  await login.login(process.env.TEST_USERNAME!, process.env.TEST_PASSWORD!);

  await expect(page).toHaveURL(/dashboard/);

  // Save authenticated storage
  await page.context().storageState({ path: 'auth.json' });
});
