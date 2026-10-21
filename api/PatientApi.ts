import { APIRequestContext } from '@playwright/test';
import { Patient } from '../utils/testData';

const API_PATH = '/openmrs/ws/rest/v1';
// Standard UUIDs from the OpenMRS reference application
const OPENMRS_ID_TYPE = '05a29f94-c0ed-11e2-94be-8c13b969e334';
const OPENMRS_ID_GENERATOR = '8549f706-7e85-4c1d-9424-217d50a2988b';
const FACILITY_VISIT_TYPE = '7b0f5697-27e3-40c4-8bae-f4049abfb4ed';

export class PatientApi {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async createPatient(patient: Patient) {
    const idResponse = await this.request.post(`${API_PATH}/idgen/identifiersource/${OPENMRS_ID_GENERATOR}/identifier`, {
      data: {},
    });
    if (!idResponse.ok()) {
      throw new Error(`Generating an OpenMRS ID failed with status ${idResponse.status()}`);
    }
    const generatedId = await idResponse.json();

    const response = await this.request.post(`${API_PATH}/patient`, {
      data: {
        person: {
          names: [{ givenName: patient.givenName, familyName: patient.familyName, preferred: true }],
          gender: patient.sex === 'Male' ? 'M' : 'F',
          birthdate: `${patient.birthYear}-${patient.birthMonth}-${patient.birthDay}`,
        },
        identifiers: [{ identifier: generatedId.identifier, identifierType: OPENMRS_ID_TYPE, preferred: true }],
      },
    });
    if (!response.ok()) {
      throw new Error(`Creating patient ${patient.fullName} failed with status ${response.status()}`);
    }
    const createdPatient = await response.json();
    return createdPatient.uuid as string;
  }

  async startVisit(patientUuid: string) {
    // Visit locations differ between OpenMRS setups (demo vs Docker), so use the first one this server has
    const locationsResponse = await this.request.get(`${API_PATH}/location?tag=Visit%20Location`);
    const locations = await locationsResponse.json();

    const response = await this.request.post(`${API_PATH}/visit`, {
      data: { patient: patientUuid, visitType: FACILITY_VISIT_TYPE, location: locations.results[0].uuid },
    });
    if (!response.ok()) {
      throw new Error(`Starting a visit failed with status ${response.status()}`);
    }
  }

  // Encounters are saved clinical records, e.g. one per "Record vitals"
  async getEncounterCount(patientUuid: string) {
    const response = await this.request.get(`${API_PATH}/encounter?patient=${patientUuid}`);
    const encounters = await response.json();
    return encounters.results.length as number;
  }

  // OpenMRS won't purge a patient who has vitals or visits, so we void (soft delete) instead.
  // Encounters and visits go first, then the patient.
  async voidPatient(patientUuid: string) {
    const encountersResponse = await this.request.get(`${API_PATH}/encounter?patient=${patientUuid}`);
    const encounters = await encountersResponse.json();
    for (const encounter of encounters.results) {
      await this.deleteResource(`encounter/${encounter.uuid}`);
    }

    const visitsResponse = await this.request.get(`${API_PATH}/visit?patient=${patientUuid}&includeInactive=true`);
    const visits = await visitsResponse.json();
    for (const visit of visits.results) {
      await this.deleteResource(`visit/${visit.uuid}`);
    }

    await this.deleteResource(`patient/${patientUuid}`);
  }

  private async deleteResource(path: string) {
    const response = await this.request.delete(`${API_PATH}/${path}`);
    if (!response.ok()) {
      throw new Error(`Cleanup failed: DELETE ${path} returned ${response.status()}`);
    }
  }
}
