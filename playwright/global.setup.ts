// import { chromium } from '@playwright/test';
// import LoginActions from './Actions/auth/loginActions';
// import dotenv from 'dotenv';
// import path from 'path';

// dotenv.config({
//   path: path.resolve(__dirname, '../.env.qa'),
// });

// async function globalSetup() {
//   const browser = await chromium.launch();
//   const page = await browser.newPage();

//   const login = new LoginActions(page);

//   await login.login(process.env.TEST_USERNAME!, process.env.TEST_PASSWORD!);

//   // Save auth state
//   await page.context().storageState({ path: '.auth/user.json' });
//   await browser.close();
// }

// export default globalSetup;
import { chromium } from '@playwright/test';
import LoginActions from './Actions/auth/loginActions';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env.qa'),
});

async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: process.env.BASE_URL,
  });
  const page = await context.newPage();

  const login = new LoginActions(page);

  await login.login(process.env.TEST_USERNAME!, process.env.TEST_PASSWORD!);

  await context.storageState({ path: '.auth/user.json' });
  await browser.close();
}

export default globalSetup;
