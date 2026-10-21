import { Page, Locator } from '@playwright/test';
import { StartVisitForm } from './StartVisitForm';
import { VitalsForm } from './VitalsForm';

export class Workspace {
  readonly root: Locator;
  readonly header: Locator;
  readonly startVisitForm: StartVisitForm;
  readonly vitalsForm: VitalsForm;

  constructor(page: Page) {
    // The side panel has no role or label, and its classes are generated, so its container id is the only stable hook
    this.root = page.locator('#omrs-workspaces-container');
    this.header = this.root.getByRole('banner', { name: 'Workspace header' });
    this.startVisitForm = new StartVisitForm(this.root);
    this.vitalsForm = new VitalsForm(this.root);
  }
}
