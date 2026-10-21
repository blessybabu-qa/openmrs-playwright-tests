import { Locator } from '@playwright/test';

// Values are strings because they are typed into the form fields
export type Vitals = {
  temperature: string;
  systolic: string;
  diastolic: string;
  pulse: string;
  respirationRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
};

export class VitalsForm {
  readonly root: Locator;
  readonly temperatureInput: Locator;
  readonly systolicInput: Locator;
  readonly diastolicInput: Locator;
  readonly pulseInput: Locator;
  readonly respirationRateInput: Locator;
  readonly oxygenSaturationInput: Locator;
  readonly weightInput: Locator;
  readonly heightInput: Locator;
  readonly bmiInput: Locator;
  readonly saveButton: Locator;
  readonly fieldError: Locator;
  readonly saveErrorNotification: Locator;
  readonly abnormalValueFlag: Locator;

  // root is the workspace panel the form opens in
  constructor(root: Locator) {
    this.root = root;
    this.temperatureInput = this.getField('Temperature');
    this.systolicInput = this.getField('systolic');
    this.diastolicInput = this.getField('diastolic');
    this.pulseInput = this.getField('Pulse');
    this.respirationRateInput = this.getField('Respiration rate');
    this.oxygenSaturationInput = this.getField('Oxygen saturation');
    this.weightInput = this.getField('Weight');
    this.heightInput = this.getField('Height');
    this.bmiInput = this.getField('BMI');
    this.saveButton = root.getByRole('button', { name: 'Save and close' });
    this.fieldError = root.getByText(/^Value must be between/);
    this.saveErrorNotification = root.getByRole('status').filter({ hasText: 'Error saving vitals and biometrics' });
    // The arrows next to the label are drawn with CSS; the marker itself carries this title
    this.abnormalValueFlag = root.getByTitle('Abnormal value');
  }

  // Finds a field by its accessible name, e.g. "Temperature" or "Oxygen saturation"
  getField(name: string) {
    return this.root.getByRole('spinbutton', { name });
  }

  async fillVitals(vitals: Vitals) {
    await this.temperatureInput.fill(vitals.temperature);
    await this.systolicInput.fill(vitals.systolic);
    await this.diastolicInput.fill(vitals.diastolic);
    await this.pulseInput.fill(vitals.pulse);
    await this.respirationRateInput.fill(vitals.respirationRate);
    await this.oxygenSaturationInput.fill(vitals.oxygenSaturation);
    await this.weightInput.fill(vitals.weight);
    await this.heightInput.fill(vitals.height);
  }

  async save() {
    await this.saveButton.click();
  }
}
