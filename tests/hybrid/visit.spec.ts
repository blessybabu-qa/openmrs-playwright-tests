import { test, expect } from '../../fixtures';

test.describe('Start a visit', () => {
  test.beforeEach(async ({ chartPage, apiPatient }) => {
    await chartPage.goto(apiPatient.uuid);
  });

  test('should start a facility visit from the patient banner', async ({ patientBanner, workspace }) => {
    await patientBanner.openAddVisit();
    await workspace.startVisitForm.selectVisitType('Facility Visit');
    await workspace.startVisitForm.startVisit();

    await expect(patientBanner.activeVisitTag).toBeVisible();
  });

  test('should not start a visit without a visit type', async ({ patientBanner, workspace }) => {
    await patientBanner.openAddVisit();
    await workspace.startVisitForm.startVisit();

    await expect(workspace.startVisitForm.missingVisitTypeError).toContainText('Please select a visit type');
    await expect(patientBanner.activeVisitTag).toBeHidden();
  });
});
