# OpenMRS 3 – Playwright Test Framework

End-to-end tests for the [OpenMRS 3](https://o3.openmrs.org) electronic medical record system, written in **Playwright + TypeScript**.

## Highlights

- **Layered framework pattern**: reusable **components** (patient banner, side workspace, vitals form, generic data table, left navigation) → **page objects** built from them → **Playwright fixtures** that hand everything to the tests. Tests contain no locators or URLs, only steps and assertions.
- **Three test types, kept apart**:
  - `ui`: pure UI flows (login, registration)
  - `hybrid`: test data created through the **REST API**, behaviour tested through the UI (search, visits, vitals). Faster and more stable than clicking through setup.
  - `api`: reserved for API-only tests (planned)
- **Positive and negative tests** for each area: invalid dates of birth, a missing visit type, out-of-range vitals, unknown users, searches with no match.
- **Data-driven tests**: one test definition, several data sets (international names, invalid birth dates, out-of-range vitals).
- **UTF-8 / internationalisation checks**: German (`Jürgen Groß-Müller`), French (`François Lefèvre`) and Chinese (`李 小明`) names are registered, shown and searched correctly.
- **Numeric validation and calculated results**: vitals ranges, a critical-value flag and BMI (70 kg / 1.75 m → 22.9), checked on the form and in the saved tables.
- **Robustness check**: a 5,000-character search must not break the app.
- **Clean test data**: Faker generates unique patients prefixed `QA-Test-`. A fixture voids every created patient after each test, even when the test fails.
- **Stable locators**: roles, labels and visible text. No fixed waits; only Playwright's auto-waiting and web-first assertions.

## Structure

```
components/   AppHeader, PatientBanner, LeftNav, Workspace, StartVisitForm, VitalsForm, DataTable
pages/        LoginPage, HomePage, RegistrationPage, PatientSearch, PatientChartPage
api/          PatientApi: create patients and visits, check saved data, clean up (REST)
utils/        testData: Faker builders, international names, vitals data
fixtures.ts   page objects, API client, apiPatient, automatic cleanup
tests/
  ui/         auth.setup, login, registration
  hybrid/     patient-search, visit, vitals
docs/         defects.md: defects found while testing
```

## Test coverage

| Area | Tests |
|---|---|
| Login | Unknown user shows an error (random user, so the shared admin account is never locked) |
| Registration | Patient appears in the banner (name, sex, DOB, OpenMRS ID) · German / French / Chinese names · DOB in the future · DOB over 140 years ago |
| Search | Find and open chart · international name · no results · very long input |
| Visits | Start a facility visit · no visit type selected |
| Vitals | Record vitals, check all values and BMI 22.9 in the tables · temperature 50 and SpO2 120 rejected, nothing saved (checked via API) · critically high pulse flagged |

17 tests, plus a login setup step that runs once and is reused through `storageState`.

## Run

Create a `.env` file:

```
BASE_URL=https://o3.openmrs.org
OPENMRS_USERNAME=admin
OPENMRS_PASSWORD=Admin123
OPENMRS_LOCATION=Outpatient Clinic
HEADLESS=false
```

```
npm ci
npx playwright install chromium
npx playwright test                    # everything
npx playwright test --project=ui       # or: hybrid
npx playwright show-report
```

The public demo blocks headless browsers, so tests run headed locally. Workers are kept low to respect the shared demo.

## CI

GitHub Actions (`.github/workflows/e2e.yml`) starts OpenMRS 3.8.0 in **Docker** (`ci/docker-compose.yml`), waits until it is ready, runs the tests **headless** and uploads the HTML report.

- Runs on every push to `main` and on pull requests
- **Manual run:** Actions tab → *E2E tests* → *Run workflow*, then choose `all`, `ui` or `hybrid`
- Needs two repository secrets: `OPENMRS_USERNAME` and `OPENMRS_PASSWORD` (`admin` / `Admin123` for the Docker image)

## Defects found

Three defects in the vitals form, written up in [docs/defects.md](docs/defects.md):

| ID | Defect | Severity |
|---|---|---|
| DEF-01 | Temperature above the system's own limit (45 °C, limit 43 °C) is accepted and stored | High |
| DEF-02 | Out-of-range height shows only a generic error, no field message | Medium |
| DEF-03 | High (non-critical) values are flagged as critically high | Medium |

## Problems solved and findings

- **API calls blocked by the demo's bot protection.** Inside UI tests the API client inherited Chrome's user agent and was challenged. Giving it its own user agent fixed cleanup.
- **Styled radio buttons block `check()`.** The tests click the visible label, as a real user does.
- **A locator that only broke with existing data.** Once a patient has vitals, the summary header also contains "Record vitals", so the button locator matched two elements. Found while verifying the defects and fixed with an exact match.
- **Finding:** the patient search box has no length limit; a 5,000-character query reaches the server (handled without errors).
- **Finding:** search ignores accents (`Gross-Muller` finds `Groß-Müller`).

## Next steps

- A reusable `RadioGroup` component for the label-click workaround used in several forms
- API-only tests (create, validation errors, authentication)
