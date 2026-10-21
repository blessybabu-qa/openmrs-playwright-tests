import { Page, Locator } from '@playwright/test';

export class PatientBanner {
  readonly root: Locator;
  readonly openmrsId: Locator;
  readonly actionsButton: Locator;
  readonly addVisitMenuItem: Locator;
  readonly activeVisitTag: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner', { name: 'patient banner' });
    this.openmrsId = this.root.getByText(/^OpenMRS ID: \S+/);
    this.actionsButton = this.root.getByRole('button', { name: 'Actions' });
    this.addVisitMenuItem = this.root.getByRole('menuitem', { name: 'Add visit' });
    // A button, because plain "Active Visit" text also matches the "End active visit" menu item
    this.activeVisitTag = this.root.getByRole('button', { name: 'Active Visit' });
  }

  // exact, so "Male" does not also match "Female"
  getItem(text: string) {
    return this.root.getByText(text, { exact: true });
  }

  async openAddVisit() {
    await this.actionsButton.click();
    await this.addVisitMenuItem.click();
  }
}
