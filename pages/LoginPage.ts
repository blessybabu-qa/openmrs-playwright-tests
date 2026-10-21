import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly confirmLocationButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.confirmLocationButton = page.getByRole('button', { name: 'Confirm' });
    this.errorMessage = page.getByRole('status');
  }

  async goto() {
    await this.page.goto('/openmrs/spa/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.continueButton.click();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // OpenMRS skips the location screen when the user already has a remembered location
  async selectLocationIfAsked(location: string) {
    await this.page.waitForURL(/\/home|\/login\/location/);

    if (this.page.url().includes('/login/location')) {
      await this.page.getByRole('radio', { name: location }).check();
      await this.confirmLocationButton.click();
      await this.page.waitForURL(/\/home/);
    }
  }
}
