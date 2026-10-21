import { faker } from '@faker-js/faker';
import { Vitals } from '../components/VitalsForm';

export const TEST_PREFIX = 'QA-Test-';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type Patient = {
  givenName: string;
  familyName: string;
  fullName: string;
  sex: 'Male' | 'Female';
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthDateInBanner: string;
};

// Real-world names with umlauts, accents and non-Latin characters. createPatient() adds the QA-Test- prefix.
export const INTERNATIONAL_NAMES = [
  { language: 'German', givenName: 'Jürgen', familyName: 'Groß-Müller' },
  { language: 'French', givenName: 'François', familyName: 'Lefèvre' },
  { language: 'Chinese', givenName: '小明', familyName: '李' },
];

export const NORMAL_VITALS: Vitals = {
  temperature: '36.8',
  systolic: '120',
  diastolic: '80',
  pulse: '72',
  respirationRate: '16',
  oxygenSaturation: '98',
  weight: '70',
  height: '175',
};

// 70 kg / (1.75 m)² = 22.86, shown rounded to one decimal
export const EXPECTED_BMI = '22.9';

// Values outside what the form allows; each field shows its own range message
export const OUT_OF_RANGE_VITALS = [
  { field: 'Temperature', value: '50', message: 'Value must be between 25 and 47' },
  { field: 'Oxygen saturation', value: '120', message: 'Value must be between 0 and 100' },
];

// A real but critically high value: it can be saved, and the form flags it
export const CRITICAL_PULSE = '140';

// A made-up user, so failed logins can never lock a real account on the shared demo
export function createUnknownUser() {
  return {
    username: `${TEST_PREFIX.toLowerCase()}${faker.internet.username()}`,
    password: faker.internet.password(),
  };
}

// A name no patient has, for "no results" searches. Random per run, so it can never match a real patient.
export function createUnknownPatientName() {
  return `${TEST_PREFIX}NoSuchPatient-${faker.string.alphanumeric(8)}`;
}

// Pass a name to use it; otherwise Faker makes one up
export function createPatient(name?: { givenName: string; familyName: string }): Patient {
  const sex = faker.helpers.arrayElement<'Male' | 'Female'>(['Male', 'Female']);

  let givenName = TEST_PREFIX + faker.person.firstName(sex === 'Male' ? 'male' : 'female');
  let familyName = faker.person.lastName();
  if (name) {
    givenName = TEST_PREFIX + name.givenName;
    familyName = name.familyName;
  }

  const birthDate = faker.date.birthdate({ mode: 'age', min: 18, max: 80 });

  const day = String(birthDate.getDate()).padStart(2, '0');
  const month = String(birthDate.getMonth() + 1).padStart(2, '0');
  const year = String(birthDate.getFullYear());

  return {
    givenName,
    familyName,
    fullName: `${givenName} ${familyName}`,
    sex,
    birthDay: day,
    birthMonth: month,
    birthYear: year,
    // The patient banner shows dates like 15-Mar-1990
    birthDateInBanner: `${day}-${MONTH_NAMES[birthDate.getMonth()]}-${year}`,
  };
}
