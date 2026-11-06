# Test plan – OpenMRS 3

## Scope

**In scope:** Login, Registration, Search, Visits, Vitals.
**Not in scope yet:** medications, appointments, billing, performance, security, browsers other than Chrome.

## Approach

- **Risk first:** the more harm an error can do, the more we test it. Wrong data in the patient record (vitals, identity) gets the most tests.
- **Automate** what must work every time: core workflows, rules, limits, saved data.
- **Test manually** what needs human judgement: clear messages, visual warnings, new behaviour we don't understand yet. Once the expected behaviour is agreed, it gets automated.
- **Every area gets** a happy path, a negative test, and limit (boundary) checks where numbers are involved.
- **Test data** is created through the API, starts with `QA-Test-`, and is deleted after each test.

## Risk by module

Risk = how bad an error would be (impact) × how likely it is (likelihood).

| Module | What could go wrong | Impact | Likelihood | Risk | Why |
|---|---|---|---|---|---|
| Vitals | Wrong or impossible values saved; misleading warnings | High | High | **High** | Clinical data. All three defects found so far are here |
| Registration | Wrong patient details; duplicate patients; patient can't be found later | High | Medium | **High** | Every later record depends on the right identity |
| Search | Wrong patient opened | High | Low | **High** | Rare, but a wrong-patient error is a patient-safety problem |
| Visits | Clinical data recorded without a visit; two active visits | Medium | Medium | **Medium** | Confuses the record, but can be corrected |
| Login | User can't log in, gets locked out, or the session stays open after logout | Medium | Low | **Medium** | Blocks all work, but the flow is simple and runs before every test run |

## Test types

| Type | What it means here | Where |
|---|---|---|
| UI end-to-end | Clicking through the app as a user does | `tests/ui` (login, registration) |
| Hybrid | Test data created through the REST API, behaviour tested through the UI | `tests/hybrid` (search, visits, vitals) |
| API checks | Checking saved data through the API after a UI action (e.g. no encounter saved) | Inside the hybrid tests |
| Data-driven | One test, several data sets | International names, invalid birth dates, out-of-range vitals |
| Negative | Wrong input must be refused with a clear message | Every module |
| Boundary | Values just inside and just outside a limit | Vitals, birth date |
| Internationalisation | German, French and Chinese names saved, shown and found | Registration, search |
| Robustness | Unusual input must not break the app (5,000-character search) | Search |
| Exploratory | Time-boxed manual sessions to find what nobody thought of | [Manual test cases](MANUAL-TEST-CASES.md) |
| Accessibility | Keyboard and screen reader use | Manual only (charter EC-02) |

## What we check

✅ Automated · 🔍 Checked manually · ⏳ Planned for automation

MTC-xx and EC-xx are in [MANUAL-TEST-CASES.md](MANUAL-TEST-CASES.md).

| Module | Check | Status |
|---|---|---|
| **Vitals** | Normal values are saved and shown, BMI 22.9 | ✅ |
| | Impossible values (temperature 50, SpO2 120) are rejected and nothing is saved | ✅ |
| | Critically high pulse is flagged | ✅ |
| | Warning levels (low / high / critical) are correct | 🔍 MTC-11, found DEF-03 |
| | Form limits match the server's limits | 🔍 MTC-09, EC-01, found DEF-01 |
| | Out-of-range height gives a clear message | 🔍 MTC-10, found DEF-02 |
| | Closing the form with unsaved values warns the user | 🔍 MTC-12 |
| | Exact limits (e.g. 47 °C accepted, 47.1 °C rejected) | ⏳ |
| **Registration** | New patient shows correct name, sex, birth date and ID | ✅ |
| | German, French and Chinese names | ✅ |
| | Birth date in the future or over 140 years ago is rejected | ✅ |
| | Duplicate patient is warned about | 🔍 MTC-03 |
| | Estimated age instead of birth date | 🔍 MTC-04 |
| | Missing first name blocks saving | ⏳ |
| **Search** | Find a patient by name and open the right chart | ✅ |
| | Find a name with ü and ß | ✅ |
| | Unknown name shows "no results" | ✅ |
| | Very long input doesn't break the app | ✅ |
| | Search ignores accents (`Gross-Muller` finds `Groß-Müller`) | 🔍 EC-03 |
| | Two patients with the same name can be told apart | 🔍 MTC-05 |
| | Search by OpenMRS ID | 🔍 MTC-06, then ⏳ |
| **Visits** | Start a visit | ✅ |
| | Can't start a visit without a visit type | ✅ |
| | End a visit | 🔍 MTC-07, then ⏳ |
| | Can't start a second visit while one is active | 🔍 MTC-08 |
| **Login** | Valid login (the setup step before every run) | ✅ |
| | Unknown user is rejected | ✅ |
| | Wrong password / lockout (Docker only, so the shared demo admin is never locked) | 🔍 MTC-01, then ⏳ |
| | No patient data visible after logout | 🔍 MTC-02 |

## Automated vs manual

**Automated** are checks with one clear right answer that must keep working after every change: core workflows, validation rules, limits, saved values. They run on every pull request and are cheap to repeat.

**Manual** checks, and why they are not automated yet:

| Check | Why manual | Automate when |
|---|---|---|
| Form vs server limits (MTC-09) | Not agreed which limit is right (43 or 47 °C). A test now would lock in one of them | Product owner decides the limit |
| Height message (MTC-10) | Message wording needs to be agreed | DEF-02 is fixed |
| Warning levels (MTC-11) | Visual markers and tooltips need a human eye; current behaviour is wrong | DEF-03 is fixed |
| Unsaved vitals warning (MTC-12) | Behaviour not confirmed yet | Behaviour is confirmed |
| Duplicate patient (MTC-03) | Not known yet whether a warning is intended | Product owner confirms |
| Estimated age (MTC-04) | Rare flow, low value as an automated test | – |
| Same-name patients (MTC-05) | Judgement: is the shown information enough to pick the right patient? | – |
| Search by ID (MTC-06) | ID format and expected matching to be confirmed | Expected results are agreed |
| End visit / second visit (MTC-07, MTC-08) | Not automated yet; expected behaviour to be confirmed | Planned |
| Lockout (MTC-01) | Only safe on Docker; needs a separate user and a 5-minute wait | A test user is created in the Docker setup |
| Logout and Back button (MTC-02) | Browser history behaviour, quick to check by hand | – |
| Accessibility (EC-02) | Needs a screen reader and human judgement | – |

## Test data

- **Patients:** generated with Faker, name starts with `QA-Test-`, created through the API (or the UI in registration tests). A fixture voids every created patient after each test, **even when the test fails**. Patient UUIDs are shown in the HTML report, so they can be found by hand if cleanup fails.
- **Fixed data sets** in `utils/testData.ts`: international names, normal vitals (BMI 22.9), out-of-range vitals, critical pulse 140, invalid birth years.
- **Users:** the admin account for normal tests; a random unknown user for failed logins, so the admin account is never locked. Lockout tests need a separate test user on Docker.
- **Manual tests** use the same `QA-Test-` naming and void the patients afterwards.
- **No real patient data** is ever used.

## Environments

| | Public demo | Docker (CI) |
|---|---|---|
| Address | https://o3.openmrs.org | http://localhost |
| Version | Latest, can change without notice | OpenMRS 3.8.0, pinned |
| Browser | Chromium, **headed** (the demo blocks headless browsers) | Chromium, headless |
| Workers | 1 (shared with other people) | 2 |
| Used for | Local runs, manual and exploratory testing | Automated runs on every push to `master`, on pull requests or by hand; lockout tests |
| Start-up | Always running | 20–45 minutes on first start |

## Entry criteria

Testing starts when:

- The environment is up: `GET /openmrs/ws/rest/v1/session` with the test user returns `"authenticated": true`.
- The `.env` file (local) or the repository secrets (CI) are set.
- The login setup step passes.
- The OpenMRS version under test is written down.

## Exit criteria

Testing is done when:

- All automated tests pass. A test that only passes on retry is investigated, not ignored.
- All High-priority manual test cases have been run, and changed areas have been checked manually.
- Every defect is verified, documented and prioritised with the product owner.
- No High defect is open without a product owner decision.
- The HTML test report is saved.

Defects found so far: [defects.md](defects.md)
