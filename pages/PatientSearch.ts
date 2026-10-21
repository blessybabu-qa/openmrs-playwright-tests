import { Page, Locator } from '@playwright/test';
import { AppHeader } from '../components/AppHeader';

export class PatientSearch {
  readonly page: Page;
  readonly header: AppHeader;
  readonly searchInput: Locator;
  readonly resultCount: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    // The search box and its results open inside the top header bar
    this.searchInput = this.header.root.getByRole('searchbox', {
      name: 'Search for a patient by name or identifier number',
    });
    this.resultCount = this.header.root.getByText(/\d+ search results?/);
    this.noResultsMessage = this.header.root.getByText('Sorry, no patient charts were found');
  }

  async open() {
    await this.header.searchPatientButton.click();
  }

  async searchFor(text: string) {
    await this.searchInput.fill(text);
  }

  getResult(fullName: string) {
    return this.header.root.getByRole('link', { name: fullName });
  }

  async openResult(fullName: string) {
    await this.getResult(fullName).click();
    await this.page.waitForURL(/\/patient\/[0-9a-f-]+\/chart/);
  }
}
