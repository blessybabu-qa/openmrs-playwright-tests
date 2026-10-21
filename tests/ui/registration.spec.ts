import { test, expect } from '../../fixtures';
import { createPatient, INTERNATIONAL_NAMES } from '../../utils/testData';

const INVALID_BIRTH_DATES = [
  { description: 'in the future', year: '2099', message: 'Birthday cannot be in future' },
  { description: 'more than 140 years ago', year: '1850', message: 'Birthday cannot be more than 140 years ago' },
];

test.describe('Patient registration', () => {
  test('should show the new patient in the patient banner', async ({
    page,
    homePage,
    registrationPage,
    patientBanner,
    patientsToCleanUp,
  }) => {
    const patient = createPatient();

    await homePage.goto();
    await homePage.header.openAddPatient();
    await registrationPage.fillPatient(patient);
    await registrationPage.register();

    const patientUuid = registrationPage.getPatientUuid();
    patientsToCleanUp.push(patientUuid);
    // Shown in the HTML report, so the patient can be found by hand if cleanup ever fails
    test.info().annotations.push({ type: 'patient', description: patientUuid });

    await expect(page).toHaveURL(/\/patient\/[0-9a-f-]+\/chart/);
    await expect(patientBanner.getItem(patient.fullName)).toBeVisible();
    await expect(patientBanner.getItem(patient.sex)).toBeVisible();
    await expect(patientBanner.getItem(patient.birthDateInBanner)).toBeVisible();
    await expect(patientBanner.openmrsId).toHaveText(/OpenMRS ID: \d+[A-Z]/);
  });

  for (const name of INTERNATIONAL_NAMES) {
    test(`should register a patient with a ${name.language} name`, async ({
      homePage,
      registrationPage,
      patientBanner,
      patientsToCleanUp,
    }) => {
      const patient = createPatient(name);

      await homePage.goto();
      await homePage.header.openAddPatient();
      await registrationPage.fillPatient(patient);
      await registrationPage.register();

      const patientUuid = registrationPage.getPatientUuid();
      patientsToCleanUp.push(patientUuid);
      test.info().annotations.push({ type: 'patient', description: patientUuid });

      await expect(patientBanner.getItem(patient.fullName)).toBeVisible();
    });
  }

  for (const invalidDate of INVALID_BIRTH_DATES) {
    test(`should not accept a date of birth ${invalidDate.description}`, async ({ page, homePage, registrationPage }) => {
      const patient = createPatient();
      patient.birthYear = invalidDate.year;

      await homePage.goto();
      await homePage.header.openAddPatient();
      await registrationPage.fillPatient(patient);
      // Click directly: register() would wait for a chart page that never opens
      await registrationPage.registerButton.click();

      await expect(registrationPage.birthDateError).toHaveText(invalidDate.message);
      await expect(page).toHaveURL(/\/patient-registration/);
    });
  }
});
