import { Page, Locator } from '@playwright/test';

export class LeftNav {
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('navigation', { name: 'Left navigation' });
  }

  getLink(name: string) {
    return this.root.getByRole('link', { name });
  }

  async open(name: string) {
    await this.getLink(name).click();
  }
}
