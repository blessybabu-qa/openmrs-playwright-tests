import { Page, Locator } from '@playwright/test';

export class AppHeader {
  readonly root: Locator;
  readonly addPatientButton: Locator;
  readonly searchPatientButton: Locator;
  readonly locationButton: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner', { name: 'OpenMRS', exact: true });
    this.addPatientButton = this.root.getByRole('button', { name: 'Add patient' });
    this.searchPatientButton = this.root.getByRole('button', { name: 'Search patient' });
    this.locationButton = this.root.getByRole('button', { name: 'Change location' });
  }

  async openAddPatient() {
    await this.addPatientButton.click();
  }
}
