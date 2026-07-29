import { test as setup } from '@playwright/test';
import LoginActions from './Actions/auth/loginActions';

setup('UI Login Setup', async ({ page }) => {
  const login = new LoginActions(page);
  await login.login(process.env.TEST_USERNAME!, process.env.TEST_PASSWORD!);
  await page.context().storageState({ path: '.auth/user.json' });
  console.log('[UI Setup] Login complete ');
});
