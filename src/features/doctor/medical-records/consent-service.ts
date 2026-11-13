import { createMockCollection, demoScenario, mockDelay, ServiceUnavailableError } from "@/lib/mock/store";
import type { ConsentForm } from "./types";
import type { ConsentFormData } from "./validations";

/**
 * Informed consent records, keyed by the patient's hospital number (`PT-000001`), so the same
 * consents appear on the patient's page and in Medical Records.
 */
export interface ConsentService {
  listConsents(patientId?: string): Promise<ConsentForm[]>;
  createConsent(data: ConsentFormData, patientName: string): Promise<ConsentForm>;
  withdrawConsent(id: string, reason: string): Promise<ConsentForm>;
}

const SEED_CONSENTS: ConsentForm[] = [
  {
    id: "c-0001",
    formNumber: "CF-0001",
    patientId: "PT-000001",
    patientName: "សុខ ដារ៉ា",
    consentType: "surgery",
    procedureName: "Laparoscopic Cholecystectomy",
    procedureDescription: "Removal of the gallbladder through small incisions using a camera, under general anaesthesia.",
    risks: ["Bleeding", "Infection", "Bile duct injury", "Conversion to open surgery"],
    benefits: ["Relief from gallstone pain", "Prevents further attacks"],
    alternatives: ["Open surgery", "Watchful waiting with diet changes"],
    explainedBy: "Dr. Chea Sovann",
    explainedByDesignation: "Consultant Surgeon",
    explainedDate: new Date("2026-11-06T10:00:00+07:00"),
    patientUnderstands: true,
    questionsAnswered: true,
    consentGivenBy: "patient",
    witnessName: "Nurse Srey Leak",
    patientSignature: "Sok Dara",
    signedDate: new Date("2026-11-06T10:20:00+07:00"),
    relatedProcedureId: "SUR-0042",
    status: "signed",
  },
];

const DATE_FIELDS = ["explainedDate", "signedDate", "withdrawnDate"] as const;
const consents = createMockCollection<ConsentForm>(
  "consents",
  () => structuredClone(SEED_CONSENTS),
  (raw) => {
    const copy = { ...raw };
    DATE_FIELDS.forEach((k) => {
      if (copy[k]) copy[k] = new Date(copy[k] as unknown as string) as never;
    });
    return copy;
  }
);

async function guard() {
  await mockDelay();
  if (demoScenario("consents") === "offline") throw new ServiceUnavailableError("Consent records");
}

const mockConsentService: ConsentService = {
  async listConsents(patientId) {
    await guard();
    return consents
      .all()
      .filter((c) => !patientId || c.patientId === patientId)
      .sort((a, b) => b.signedDate.getTime() - a.signedDate.getTime());
  },

  async createConsent(data, patientName) {
    await guard();
    const now = new Date();
    const { signatureName, ...rest } = data;
    const byPatient = data.consentGivenBy === "patient";
    return consents.insert({
      ...rest,
      id: `c-${crypto.randomUUID().slice(0, 8)}`,
      formNumber: `CF-${String(consents.all().length + 1).padStart(4, "0")}`,
      patientName,
      relatedProcedureId: data.relatedProcedureId || undefined,
      guardianName: byPatient ? undefined : data.guardianName,
      guardianRelation: byPatient ? undefined : data.guardianRelation,
      guardianPhone: byPatient ? undefined : data.guardianPhone,
      patientSignature: byPatient ? signatureName : undefined,
      guardianSignature: byPatient ? undefined : signatureName,
      explainedDate: now,
      signedDate: now,
      status: "signed",
    });
  },

  async withdrawConsent(id, reason) {
    await guard();
    const updated = consents.update(id, { status: "withdrawn", withdrawnDate: new Date(), withdrawnReason: reason });
    if (!updated) throw new Error("Consent form not found.");
    return updated;
  },
};

export const consentService: ConsentService = mockConsentService;
