import { test as base } from '@playwright/test';
import { PatientApi } from './api/PatientApi';
import { PatientBanner } from './components/PatientBanner';
import { Workspace } from './components/Workspace';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PatientChartPage } from './pages/PatientChartPage';
import { PatientSearch } from './pages/PatientSearch';
import { RegistrationPage } from './pages/RegistrationPage';
import { createPatient, Patient } from './utils/testData';

type ApiPatient = Patient & { uuid: string };

type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  registrationPage: RegistrationPage;
  patientSearch: PatientSearch;
  chartPage: PatientChartPage;
  patientBanner: PatientBanner;
  workspace: Workspace;
  patientApi: PatientApi;
  patientsToCleanUp: string[];
  apiPatient: ApiPatient;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },

  patientSearch: async ({ page }, use) => {
    await use(new PatientSearch(page));
  },

  chartPage: async ({ page }, use) => {
    await use(new PatientChartPage(page));
  },

  patientBanner: async ({ page }, use) => {
    await use(new PatientBanner(page));
  },

  workspace: async ({ page }, use) => {
    await use(new Workspace(page));
  },

  // Its own API client with basic auth. The demo's bot check blocks API calls that carry
  // browser cookies or a Chrome user agent, so it gets neither.
  patientApi: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: process.env.BASE_URL,
      userAgent: 'openmrs-playwright-tests',
      httpCredentials: {
        username: process.env.OPENMRS_USERNAME!,
        password: process.env.OPENMRS_PASSWORD!,
      },
    });
    await use(new PatientApi(request));
    await request.dispose();
  },

  // Tests add the UUID of every patient they create; after the test, pass or fail, each one is voided
  patientsToCleanUp: async ({ patientApi }, use) => {
    const patientUuids: string[] = [];
    await use(patientUuids);

    for (const patientUuid of patientUuids) {
      await patientApi.voidPatient(patientUuid);
    }
  },

  // A fresh QA-Test- patient created through the API, for tests where registration is not what is being tested
  apiPatient: async ({ patientApi, patientsToCleanUp }, use) => {
    const patient = createPatient();
    const uuid = await patientApi.createPatient(patient);
    patientsToCleanUp.push(uuid);

    await use({ ...patient, uuid });
  },
});

export { expect } from '@playwright/test';
