import { createMockCollection, demoScenario, mockDelay, ServiceUnavailableError } from "@/lib/mock/store";
import { normalizeCambodianPhone } from "@/lib/cambodia/phone";
import { SEED_APPOINTMENTS, SEED_EHR_RECORDS, SEED_PATIENTS, SEED_VISITS } from "./mock-data";
import { patientMatches, toPatientFields } from "./patient-utils";
import type { Appointment, EHRRecord, Patient, Visit } from "./types";
import type { AppointmentFormData, PatientRegistrationFormData, VisitFormData } from "./validations";

/**
 * Everything the front desk does with patients. Screens use only this interface; the mock
 * below stands in until the HMS backend exists, then an HTTP implementation replaces it.
 */
export interface PatientService {
  listPatients(query?: string): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | null>;
  /** Finds a patient by hospital number, QR code, ID number or phone (check-in). */
  findPatient(identifier: string): Promise<Patient | null>;
  registerPatient(data: PatientRegistrationFormData): Promise<Patient>;
  updatePatient(id: string, data: PatientRegistrationFormData): Promise<Patient>;

  listAppointments(patientId?: string): Promise<Appointment[]>;
  scheduleAppointment(data: AppointmentFormData): Promise<Appointment>;
  listVisits(patientId?: string): Promise<Visit[]>;
  recordVisit(data: VisitFormData): Promise<Visit>;
  listRecords(patientId: string): Promise<EHRRecord[]>;
}

// Dates in these records are Date objects; JSON stores them as strings.
const reviveDates = <T extends object>(keys: (keyof T)[]) => (raw: T): T => {
  const copy = { ...raw };
  keys.forEach((k) => {
    if (copy[k]) copy[k] = new Date(copy[k] as unknown as string) as T[keyof T];
  });
  return copy;
};

const patients = createMockCollection<Patient>("patients", () => structuredClone(SEED_PATIENTS));
const appointments = createMockCollection<Appointment>(
  "appointments",
  () => structuredClone(SEED_APPOINTMENTS),
  reviveDates<Appointment>(["appointmentDate"])
);
const visits = createMockCollection<Visit>("visits", () => structuredClone(SEED_VISITS), reviveDates<Visit>(["visitDate"]));
const records = createMockCollection<EHRRecord>("ehr-records", () => structuredClone(SEED_EHR_RECORDS), reviveDates<EHRRecord>(["date"]));

/** `?patients=offline` or `?patients=empty` for walkthroughs. */
async function guard() {
  await mockDelay();
  const mode = demoScenario("patients");
  if (mode === "offline") throw new ServiceUnavailableError("The patient registry");
  return mode;
}

const byNewest = <T,>(date: (x: T) => Date | string | undefined) => (a: T, b: T) =>
  new Date(date(b) ?? 0).getTime() - new Date(date(a) ?? 0).getTime();

function nextPatientNumber() {
  const max = patients
    .all()
    .map((p) => Number(p.patientId.replace(/\D/g, "")))
    .reduce((m, n) => (Number.isFinite(n) && n > m ? n : m), 0);
  return `PT-${String(max + 1).padStart(6, "0")}`;
}

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const mockPatientService: PatientService = {
  async listPatients(query = "") {
    if ((await guard()) === "empty") return [];
    return patients
      .all()
      .filter((p) => patientMatches(p, query))
      .sort(byNewest((p) => p.lastVisitAt ?? p.registeredAt));
  },

  async getPatient(id) {
    await guard();
    return patients.get(id) ?? null;
  },

  async findPatient(identifier) {
    await guard();
    const value = identifier.trim();
    const phone = normalizeCambodianPhone(value);
    return (
      patients.find(
        (p) =>
          p.patientId.toLowerCase() === value.toLowerCase() ||
          p.qrCode === value ||
          (p.identity.type !== "none" && p.identity.number.toLowerCase() === value.toLowerCase()) ||
          (phone !== null && p.phone === phone)
      ) ??
      patients.all().find((p) => patientMatches(p, value)) ??
      null
    );
  },

  async registerPatient(data) {
    await guard();
    const patientId = nextPatientNumber();
    return patients.insert({
      id: newId("p"),
      patientId,
      ...toPatientFields(data),
      qrCode: `HMS-${patientId}`,
      registeredAt: new Date().toISOString(),
      status: "active",
    });
  },

  async updatePatient(id, data) {
    await guard();
    const updated = patients.update(id, toPatientFields(data));
    if (!updated) throw new Error("Patient not found.");
    return updated;
  },

  async listAppointments(patientId) {
    if ((await guard()) === "empty") return [];
    return appointments
      .all()
      .filter((a) => !patientId || a.patientId === patientId)
      .sort(byNewest((a) => a.appointmentDate));
  },

  async scheduleAppointment(data) {
    await guard();
    return appointments.insert({ id: newId("a"), ...data, status: "scheduled" });
  },

  async listVisits(patientId) {
    if ((await guard()) === "empty") return [];
    return visits
      .all()
      .filter((v) => !patientId || v.patientId === patientId)
      .sort(byNewest((v) => v.visitDate));
  },

  async recordVisit(data) {
    await guard();
    const visit = visits.insert({ id: newId("v"), ...data, status: "completed" });
    records.insert({
      id: newId("e"),
      patientId: data.patientId,
      recordType: "visit",
      date: data.visitDate,
      title: `${data.type.charAt(0).toUpperCase()}${data.type.slice(1)} visit`,
      description: [
        `Chief complaint: ${data.chiefComplaint}.`,
        data.diagnosis && `Diagnosis: ${data.diagnosis}.`,
        data.treatment && `Treatment: ${data.treatment}.`,
      ]
        .filter(Boolean)
        .join(" "),
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      department: data.department,
    });
    const patient = patients.find((p) => p.patientId === data.patientId);
    if (patient) patients.update(patient.id, { lastVisitAt: data.visitDate.toISOString() });
    return visit;
  },

  async listRecords(patientId) {
    if ((await guard()) === "empty") return [];
    return records
      .all()
      .filter((r) => r.patientId === patientId)
      .sort(byNewest((r) => r.date));
  },
};

export const patientService: PatientService = mockPatientService;
