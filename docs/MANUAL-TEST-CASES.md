# Manual test cases – OpenMRS 3

Tests for things that are not automated. Why each one is manual is explained in the [test plan](TEST-PLAN.md#automated-vs-manual).

**For every case:** log in as admin with location "Outpatient Clinic". All patients you create start with `QA-Test-` and are voided after testing. Write down the environment, version and date of each run.

| ID | Title | Module | Priority |
|---|---|---|---|
| [MTC-01](#mtc-01-account-locks-after-too-many-wrong-passwords) | Account locks after too many wrong passwords | Login | Medium |
| [MTC-02](#mtc-02-no-patient-data-after-logout) | No patient data after logout | Login | High |
| [MTC-03](#mtc-03-warning-for-a-duplicate-patient) | Warning for a duplicate patient | Registration | High |
| [MTC-04](#mtc-04-register-a-patient-with-an-estimated-age) | Register a patient with an estimated age | Registration | Medium |
| [MTC-05](#mtc-05-tell-apart-two-patients-with-the-same-name) | Tell apart two patients with the same name | Search | High |
| [MTC-06](#mtc-06-search-by-openmrs-id) | Search by OpenMRS ID | Search | High |
| [MTC-07](#mtc-07-record-vitals-after-the-visit-has-ended) | Record vitals after the visit has ended | Visits | Medium |
| [MTC-08](#mtc-08-start-a-second-visit-while-one-is-active) | Start a second visit while one is active | Visits | Medium |
| [MTC-09](#mtc-09-temperature-above-the-servers-limit) | Temperature above the server's limit | Vitals | High |
| [MTC-10](#mtc-10-message-for-out-of-range-height) | Message for out-of-range height | Vitals | Medium |
| [MTC-11](#mtc-11-warning-markers-for-pulse-values) | Warning markers for pulse values | Vitals | High |
| [MTC-12](#mtc-12-warning-for-unsaved-vitals) | Warning for unsaved vitals | Vitals | Medium |

---

## MTC-01: Account locks after too many wrong passwords

**Module:** Login · **Priority:** Medium

**Precondition:** Docker environment only, never the public demo. A non-admin test user exists. You are logged out.

**Steps**
1. Open the login page and enter the test username.
2. Enter a wrong password and click **Log in**.
3. Repeat step 2 until the limit in the setting `security.allowedFailedLoginsBeforeLockout` is reached (default 7).
4. Enter the correct password and click **Log in**.
5. Wait 5 minutes, then log in with the correct password.

**Expected result**
- Each wrong try shows "Invalid username or password". The message never says whether the username exists.
- Step 4: the correct password is also refused, because the account is locked.
- Step 5: login works.

---

## MTC-02: No patient data after logout

**Module:** Login · **Priority:** High

**Precondition:** A patient chart is open. Copy its URL.

**Steps**
1. Open the user menu and click **Logout**.
2. Press the browser **Back** button.
3. Paste the chart URL into the address bar and press Enter.

**Expected result**
- In every step the login page is shown.
- No patient name or data is visible at any time.

---

## MTC-03: Warning for a duplicate patient

**Module:** Registration · **Priority:** High

**Precondition:** Patient `QA-Test-Anna Weber`, female, born 15-03-1990, is already registered.

**Steps**
1. Click **Add patient**.
2. Enter the same first name, family name, sex and birth date.
3. Click **Register patient**.

**Expected result**
- A warning about a possible duplicate patient appears before saving.
- If there is no warning, write that down and check with the product owner whether this is intended.

---

## MTC-04: Register a patient with an estimated age

**Module:** Registration · **Priority:** Medium

**Precondition:** None.

**Steps**
1. Click **Add patient** and enter a first name, family name and sex.
2. At "Date of birth known?" choose **No**.
3. Enter estimated years **35** and months **0**.
4. Click **Register patient**.

**Expected result**
- The patient is saved and the chart opens.
- The banner shows age 35 and marks the birth date as estimated.

---

## MTC-05: Tell apart two patients with the same name

**Module:** Search · **Priority:** High

**Precondition:** Two patients with the same name, but different sex and birth date.

**Steps**
1. Search for the name.
2. Compare the two results.
3. Open the first result, check the banner, go back and open the second.

**Expected result**
- 2 results are shown.
- Each result shows the OpenMRS ID, sex and age or birth date, so the right patient can be picked.
- Each result opens the right chart: the ID in the banner matches the ID in the result.

---

## MTC-06: Search by OpenMRS ID

**Module:** Search · **Priority:** High

**Precondition:** A patient whose OpenMRS ID is noted down.

**Steps**
1. Search for the full ID.
2. Search for the ID with one character changed.
3. Search for the ID with spaces before and after it.

**Expected result**
- Step 1: exactly that patient is found.
- Step 2: the original patient is not found.
- Step 3: the patient is found, or "no results" is shown.
- No error appears in any step.

---

## MTC-07: Record vitals after the visit has ended

**Module:** Visits · **Priority:** Medium

**Precondition:** A patient with an active visit.

**Steps**
1. Open the patient's chart.
2. Use **End visit** and confirm.
3. Check the patient banner and the Visits list.
4. Click **Record vitals**.

**Expected result**
- The "Active visit" tag disappears from the banner.
- The visit in the Visits list shows an end time.
- Record vitals asks the user to start a visit first. No vitals can be saved without a visit.

---

## MTC-08: Start a second visit while one is active

**Module:** Visits · **Priority:** Medium

**Precondition:** A patient with an active visit.

**Steps**
1. Open the patient's chart.
2. Try to start a new visit.

**Expected result**
- Either the option to start a visit is not offered, or a message says a visit is already active.
- Only one active visit appears in the Visits list.

---

## MTC-09: Temperature above the server's limit

**Module:** Vitals · **Priority:** High

**Precondition:** A patient with an active visit. Click **Record vitals** to open the form.

**Steps**
1. Enter Temperature **45**. Leave all other fields empty.
2. Click **Save and close**.
3. Open **Vitals & Biometrics** in the left menu.

**Expected result**
- "Value must be between 25 and 43" appears under Temperature (the server's allowed range).
- Nothing is saved: no new row in the vitals table.

---

## MTC-10: Message for out-of-range height

**Module:** Vitals · **Priority:** Medium

**Precondition:** As MTC-09.

**Steps**
1. Enter Height **5** and leave the field.
2. Click **Save and close**.
3. Repeat steps 1–2 with Height **300**.

**Expected result**
- A message with the allowed range appears under Height, the same way as for Temperature.
- The form is not sent, and no generic error pop-up appears.
- Nothing is saved.

---

## MTC-11: Warning markers for pulse values

**Module:** Vitals · **Priority:** High

**Precondition:** As MTC-09.

**Steps**
1. Enter each Pulse value from the table below and leave the field.
2. Note the marker shown next to the value.
3. Move the mouse over the marker and read the tooltip.

**Expected result**

| Pulse | Expected marker |
|---|---|
| 40 | ↓↓ critically low |
| 52 | ↓ low |
| 72 | none |
| 110 | ↑ high |
| 140 | ↑↑ critically high |

Each tooltip names the level (low, high, critically low, critically high).

---

## MTC-12: Warning for unsaved vitals

**Module:** Vitals · **Priority:** Medium

**Precondition:** As MTC-09.

**Steps**
1. Enter Temperature **36.8** and Pulse **72**.
2. Close the form with **X**.
3. Choose to stay on the form.
4. Close the form again and choose to discard.

**Expected result**
- Step 2: a warning about unsaved changes appears.
- Step 3: the values are still in the form.
- Step 4: the form closes and nothing is saved.

---

# Exploratory charters

Time-boxed sessions without fixed steps. Write notes as you go. At the end, write down what you tested, what you found, and new questions. Report defects in [defects.md](defects.md).

## EC-01: Vitals limits

**Charter:** Explore the limits of every vitals field, comparing the form with the server, to find more places where the two disagree.

**Time box:** 60 minutes · **Linked defects:** [DEF-01](defects.md#def-01-temperature-above-the-systems-own-absolute-limit-is-accepted-and-stored), [DEF-02](defects.md#def-02-out-of-range-height-shows-only-a-generic-error-no-field-message)

**Ideas to try**
- For each field (temperature, blood pressure, pulse, respiration rate, SpO2, weight, height), get the server's limits with `GET /concept/<uuid>` (`hiAbsolute`, `lowAbsolute`) and compare them with the form's message.
- Enter values exactly at the limit, just inside and just outside it.
- Try decimals, a comma instead of a point, negative numbers, 0, and very large numbers.
- Fill in several fields with one wrong value: does the user learn which one is wrong?
- After each save, check what was really stored with `GET /obs?patient=<uuid>`.

## EC-02: Warning markers and accessibility

**Charter:** Explore the warning markers on vitals with keyboard and screen reader, to find warnings that are misleading or that some users cannot understand.

**Time box:** 45 minutes · **Linked defect:** [DEF-03](defects.md#def-03-high-non-critical-values-are-flagged-as-critically-high)

**Ideas to try**
- Check low / high / critical markers on all vitals fields, not only pulse.
- Fill in and save the whole form using only the keyboard (Tab, Shift+Tab, Enter).
- Use a screen reader (NVDA on Windows): is each marker read out with its level, or only "Abnormal value"?
- Check that markers are not shown by colour alone.
- Check the saved vitals table: are the same markers shown there?

## EC-03: Patient identity from registration to chart

**Charter:** Explore patient identity from registration through search to the chart, using accents, non-Latin names and similar names, to find ways the wrong patient could be opened.

**Time box:** 60 minutes · **Linked defects:** none yet

**Ideas to try**
- Register names with accents, apostrophes (`O'Brien`), hyphens, double spaces and Chinese characters, then search for them in different ways.
- Search with and without accents (`Gross-Muller` / `Groß-Müller`), in upper and lower case, and by part of the name.
- Register patients with very similar names (`Jon Smith` / `John Smith`) and check whether the results are clear.
- Search by OpenMRS ID, partial ID and mistyped ID.
- Check that the name looks the same in the search result, banner and visit list.
