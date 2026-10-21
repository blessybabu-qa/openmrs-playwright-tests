import { test, expect } from '../../fixtures';
import { CRITICAL_PULSE, EXPECTED_BMI, NORMAL_VITALS, OUT_OF_RANGE_VITALS } from '../../utils/testData';

test.describe('Vitals and biometrics', () => {
  test.beforeEach(async ({ apiPatient, patientApi, chartPage }) => {
    // Vitals can only be recorded during a visit. Starting one through the UI is covered in visit.spec.ts.
    await patientApi.startVisit(apiPatient.uuid);
    await chartPage.goto(apiPatient.uuid);
    await chartPage.openVitalsForm();
  });

  test('should record vitals and show them with the calculated BMI', async ({ chartPage }) => {
    const vitalsForm = chartPage.workspace.vitalsForm;

    await vitalsForm.fillVitals(NORMAL_VITALS);
    await expect(vitalsForm.bmiInput).toHaveValue(EXPECTED_BMI);
    await vitalsForm.save();
    await expect(chartPage.workspace.header).toBeHidden();

    await chartPage.leftNav.open('Vitals & Biometrics');

    const temperatureCell = await chartPage.vitalsTable.getCell('Today', 'Temp (DEG C)');
    await expect(temperatureCell).toHaveText(NORMAL_VITALS.temperature);
    const bloodPressureCell = await chartPage.vitalsTable.getCell('Today', 'BP (mmHg)');
    await expect(bloodPressureCell).toHaveText(`${NORMAL_VITALS.systolic} / ${NORMAL_VITALS.diastolic}`);
    const pulseCell = await chartPage.vitalsTable.getCell('Today', 'Pulse (beats/min)');
    await expect(pulseCell).toHaveText(NORMAL_VITALS.pulse);
    const respirationRateCell = await chartPage.vitalsTable.getCell('Today', 'R. Rate (breaths/min)');
    await expect(respirationRateCell).toHaveText(NORMAL_VITALS.respirationRate);
    const oxygenSaturationCell = await chartPage.vitalsTable.getCell('Today', 'SpO2 (%)');
    await expect(oxygenSaturationCell).toHaveText(NORMAL_VITALS.oxygenSaturation);

    const weightCell = await chartPage.biometricsTable.getCell('Today', 'Weight (kg)');
    await expect(weightCell).toHaveText(NORMAL_VITALS.weight);
    const heightCell = await chartPage.biometricsTable.getCell('Today', 'Height (cm)');
    await expect(heightCell).toHaveText(NORMAL_VITALS.height);
    const bmiCell = await chartPage.biometricsTable.getCell('Today', 'BMI (kg / m²)');
    await expect(bmiCell).toHaveText(EXPECTED_BMI);
  });

  for (const outOfRange of OUT_OF_RANGE_VITALS) {
    test(`should reject ${outOfRange.field} ${outOfRange.value} and save nothing`, async ({
      chartPage,
      patientApi,
      apiPatient,
    }) => {
      const vitalsForm = chartPage.workspace.vitalsForm;

      await vitalsForm.getField(outOfRange.field).fill(outOfRange.value);
      await vitalsForm.save();

      await expect(vitalsForm.fieldError).toHaveText(outOfRange.message);
      await expect(vitalsForm.saveErrorNotification).toBeVisible();
      const savedEncounters = await patientApi.getEncounterCount(apiPatient.uuid);
      expect(savedEncounters).toBe(0);
    });
  }

  test('should flag a critically high pulse', async ({ chartPage }) => {
    const vitalsForm = chartPage.workspace.vitalsForm;

    await vitalsForm.pulseInput.fill(CRITICAL_PULSE);
    await vitalsForm.pulseInput.blur();

    await expect(vitalsForm.abnormalValueFlag).toBeVisible();
  });
});
