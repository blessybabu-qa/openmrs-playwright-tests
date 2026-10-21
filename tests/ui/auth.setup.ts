import { test as setup, expect } from '../../fixtures';

const AUTH_FILE = '.auth/admin.json';

setup('log in as admin', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login(process.env.OPENMRS_USERNAME!, process.env.OPENMRS_PASSWORD!);
  await loginPage.selectLocationIfAsked(process.env.OPENMRS_LOCATION!);

  await expect(page).toHaveURL(/\/openmrs\/spa\/home/);

  await page.context().storageState({ path: AUTH_FILE });
});
