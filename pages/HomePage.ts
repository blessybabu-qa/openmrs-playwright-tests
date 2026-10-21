import { Page } from '@playwright/test';
import { AppHeader } from '../components/AppHeader';

export class HomePage {
  readonly page: Page;
  readonly header: AppHeader;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
  }

  async goto() {
    await this.page.goto('/openmrs/spa/home');
  }
}
