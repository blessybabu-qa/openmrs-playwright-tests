import { Page, Locator } from '@playwright/test';
import { DataTable } from '../components/DataTable';
import { LeftNav } from '../components/LeftNav';
import { PatientBanner } from '../components/PatientBanner';
import { Workspace } from '../components/Workspace';

export class PatientChartPage {
  readonly page: Page;
  readonly banner: PatientBanner;
  readonly leftNav: LeftNav;
  readonly workspace: Workspace;
  readonly vitalsTable: DataTable;
  readonly biometricsTable: DataTable;
  readonly recordVitalsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.banner = new PatientBanner(page);
    this.leftNav = new LeftNav(page);
    this.workspace = new Workspace(page);
    this.vitalsTable = new DataTable(page.getByRole('table', { name: 'vitals' }));
    this.biometricsTable = new DataTable(page.getByRole('table', { name: 'biometrics' }));
    // exact, because once a patient has vitals the clickable summary header also contains "Record vitals"
    this.recordVitalsButton = page.getByRole('button', { name: 'Record vitals', exact: true });
  }

  async goto(patientUuid: string) {
    await this.page.goto(`/openmrs/spa/patient/${patientUuid}/chart/patient-summary`);
  }

  async openVitalsForm() {
    await this.recordVitalsButton.click();
  }
}
