import { Locator } from '@playwright/test';

export class StartVisitForm {
  readonly root: Locator;
  readonly startVisitButton: Locator;
  readonly missingVisitTypeError: Locator;

  // root is the workspace panel the form opens in
  constructor(root: Locator) {
    this.root = root;
    this.startVisitButton = root.getByRole('button', { name: 'Start visit' });
    this.missingVisitTypeError = root.getByRole('alert').filter({ hasText: 'Missing visit type' });
  }

  async selectVisitType(visitType: string) {
    // Click the label: the styled radio circle covers the real input, like on the registration form
    await this.root.getByText(visitType, { exact: true }).click();
  }

  async startVisit() {
    await this.startVisitButton.click();
  }
}
