import { test, expect } from '../../fixtures';
import { createUnknownUser } from '../../utils/testData';

test.describe('Login', () => {
  // These tests need a logged-out browser, so don't load the saved admin session
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should show an error for an unknown username', async ({ loginPage, page }) => {
    const unknownUser = createUnknownUser();

    await loginPage.goto();
    await loginPage.login(unknownUser.username, unknownUser.password);

    await expect(loginPage.errorMessage).toContainText('Invalid username or password');
    await expect(page).toHaveURL(/\/openmrs\/spa\/login/);
  });
});
