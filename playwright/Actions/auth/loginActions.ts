import { Page, expect } from '@playwright/test';
import pwTranslate from '../../support/translations';

export default class LoginActions {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await this.page.goto('/login');

    await this.page
      .getByPlaceholder(pwTranslate('usernameEmailIdTextPlaceholder'))
      .fill(username);

    const nextButton = this.page.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    const passwordInput = this.page.getByPlaceholder(
      pwTranslate('passwordPlaceholder')
    );
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);

    const loginButton = this.page.locator(
      'button[aria-label="login-submit-button"]'
    );
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    await expect(this.page).toHaveURL(/dashboard/, { timeout: 15000 });
  }
}
