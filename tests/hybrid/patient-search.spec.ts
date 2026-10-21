import { test, expect } from '../../fixtures';
import { createPatient, createUnknownPatientName } from '../../utils/testData';

const VERY_LONG_INPUT_LENGTH = 5000;

test.describe('Patient search', () => {
  test('should find the patient by name and open their chart', async ({
    page,
    apiPatient,
    homePage,
    patientSearch,
    patientBanner,
  }) => {
    await homePage.goto();
    await patientSearch.open();
    await patientSearch.searchFor(apiPatient.fullName);

    await expect(patientSearch.resultCount).toHaveText('1 search result');
    await expect(patientSearch.getResult(apiPatient.fullName)).toBeVisible();

    await patientSearch.openResult(apiPatient.fullName);

    await expect(page).toHaveURL(new RegExp(`/patient/${apiPatient.uuid}/chart`));
    await expect(patientBanner.getItem(apiPatient.fullName)).toBeVisible();
  });

  test('should find a patient with an international name', async ({
    patientApi,
    patientsToCleanUp,
    homePage,
    patientSearch,
  }) => {
    const patient = createPatient({ givenName: 'Jürgen', familyName: 'Groß-Müller' });
    const patientUuid = await patientApi.createPatient(patient);
    patientsToCleanUp.push(patientUuid);

    await homePage.goto();
    await patientSearch.open();
    await patientSearch.searchFor(patient.familyName);

    await expect(patientSearch.getResult(patient.fullName)).toBeVisible();
  });

  test('should show a message when no patient matches', async ({ homePage, patientSearch }) => {
    await homePage.goto();
    await patientSearch.open();
    await patientSearch.searchFor(createUnknownPatientName());

    await expect(patientSearch.noResultsMessage).toBeVisible();
  });

  test('should handle a very long search text without breaking', async ({ homePage, patientSearch }) => {
    const veryLongText = createUnknownPatientName() + 'x'.repeat(VERY_LONG_INPUT_LENGTH);

    await homePage.goto();
    await patientSearch.open();
    await patientSearch.searchFor(veryLongText);

    await expect(patientSearch.noResultsMessage).toBeVisible();
  });
});
