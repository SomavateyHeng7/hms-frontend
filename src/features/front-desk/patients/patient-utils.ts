import { differenceInYears } from "date-fns";
import { formatAddressEn, formatAddressKm } from "@/lib/cambodia/address";
import { formatCambodianPhone, normalizeCambodianPhone } from "@/lib/cambodia/phone";
import type { CoverageScheme, Patient, Sex } from "./types";
import type { PatientRegistrationFormData } from "./validations";

export const COVERAGE_LABELS: Record<CoverageScheme, string> = {
  none: "No coverage",
  nssf: "NSSF",
  hef: "Health Equity Fund",
  private: "Private insurance",
};

export const RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Grandparent", "Relative", "Friend", "Other"];

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/** "សុខ ដារ៉ា" (family name first). Empty for foreign patients without a Khmer name. */
export function khmerFullName(p: Pick<Patient, "khmerName">) {
  return `${p.khmerName.family} ${p.khmerName.given}`.trim();
}

/** Main display name: Khmer when available, otherwise Latin. */
export function displayName(p: Pick<Patient, "khmerName" | "latinName">) {
  return khmerFullName(p) || latinFullName(p);
}

/** "SOK Dara": family name in capitals, as on Cambodian ID documents. */
export function latinFullName(p: Pick<Patient, "latinName">) {
  return `${p.latinName.family.toUpperCase()} ${p.latinName.given}`.trim();
}

/** Current age in years; for an estimated age, counts the years since registration. */
export function patientAge(p: Pick<Patient, "dateOfBirth" | "estimatedAge" | "registeredAt">, now = new Date()) {
  if (p.dateOfBirth) return differenceInYears(now, new Date(p.dateOfBirth));
  if (p.estimatedAge !== undefined) return p.estimatedAge + differenceInYears(now, new Date(p.registeredAt));
  return undefined;
}

type Translate = (text: string, vars?: Record<string, string | number>) => string;
const fillOnly: Translate = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k: string) => String(vars?.[k] ?? m));

/** Pass the screen's `useTranslateAny()` to get the label in the reader's language. */
export function ageLabel(p: Pick<Patient, "dateOfBirth" | "estimatedAge" | "registeredAt">, tr: Translate = fillOnly) {
  const age = patientAge(p);
  if (age === undefined) return tr("Age unknown");
  return p.dateOfBirth ? tr("{age} years", { age }) : tr("~{age} years (estimated)", { age });
}

export function patientAddressEn(p: Pick<Patient, "address">) {
  return formatAddressEn(p.address);
}

export function patientAddressKm(p: Pick<Patient, "address">) {
  return formatAddressKm(p.address);
}

export function coverageSummary(p: Pick<Patient, "coverage">, tr: Translate = fillOnly) {
  const c = p.coverage;
  switch (c.scheme) {
    case "nssf":
      return `${tr("NSSF")} · ${c.memberId}`;
    case "hef":
      return `${tr("Health Equity Fund")} · ${c.memberId}`;
    case "private":
      return `${c.insurer} · ${c.policyNumber}`;
    default:
      return tr(COVERAGE_LABELS.none);
  }
}

/** Fields shared by "create" and "update", built from the registration form. */
export function toPatientFields(d: PatientRegistrationFormData) {
  const phone = normalizeCambodianPhone(d.phone) ?? d.phone;
  return {
    khmerName: { family: d.khmerFamilyName, given: d.khmerGivenName },
    latinName: { family: d.latinFamilyName, given: d.latinGivenName },
    sex: d.sex as Sex,
    dateOfBirth: d.birthDateKnown ? d.dateOfBirth : undefined,
    estimatedAge: d.birthDateKnown ? undefined : d.estimatedAge,
    identity:
      d.identityType === "national_id"
        ? { type: "national_id" as const, number: d.identityNumber ?? "" }
        : d.identityType === "passport"
          ? { type: "passport" as const, number: (d.identityNumber ?? "").toUpperCase(), nationality: d.nationality ?? "" }
          : { type: "none" as const },
    phone,
    address: {
      provinceId: d.provinceId,
      districtId: d.districtId,
      communeId: d.communeId,
      village: d.village || undefined,
      houseStreet: d.houseStreet || undefined,
    },
    coverage:
      d.coverageScheme === "private"
        ? { scheme: "private" as const, insurer: d.insurer, policyNumber: d.policyNumber }
        : d.coverageScheme === "none"
          ? { scheme: "none" as const }
          : { scheme: d.coverageScheme, memberId: d.coverageMemberId },
    emergencyContact: {
      name: d.emergencyName ?? "",
      relationship: d.emergencyRelationship ?? "",
      phone: d.emergencyPhone ? (normalizeCambodianPhone(d.emergencyPhone) ?? d.emergencyPhone) : "",
    },
    bloodType: d.bloodType || undefined,
    allergies: d.allergies || undefined,
    medicalHistory: d.medicalHistory || undefined,
    currentMedications: d.currentMedications || undefined,
  } satisfies Partial<Patient>;
}

export const emptyRegistrationForm = (): PatientRegistrationFormData => ({
  khmerFamilyName: "",
  khmerGivenName: "",
  latinFamilyName: "",
  latinGivenName: "",
  sex: "",
  birthDateKnown: false,
  dateOfBirth: "",
  estimatedAge: undefined,
  identityType: "none",
  identityNumber: "",
  nationality: "",
  phone: "",
  provinceId: "",
  districtId: "",
  communeId: "",
  village: "",
  houseStreet: "",
  coverageScheme: "none",
  coverageMemberId: "",
  insurer: "",
  policyNumber: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  bloodType: "",
  allergies: "",
  medicalHistory: "",
  currentMedications: "",
});

export function toRegistrationForm(p: Patient): PatientRegistrationFormData {
  return {
    ...emptyRegistrationForm(),
    khmerFamilyName: p.khmerName.family,
    khmerGivenName: p.khmerName.given,
    latinFamilyName: p.latinName.family,
    latinGivenName: p.latinName.given,
    sex: p.sex,
    birthDateKnown: !!p.dateOfBirth,
    dateOfBirth: p.dateOfBirth ?? "",
    estimatedAge: p.dateOfBirth ? undefined : patientAge(p),
    identityType: p.identity.type,
    identityNumber: p.identity.type === "none" ? "" : p.identity.number,
    nationality: p.identity.type === "passport" ? p.identity.nationality : "",
    phone: formatCambodianPhone(p.phone),
    provinceId: p.address.provinceId,
    districtId: p.address.districtId,
    communeId: p.address.communeId,
    village: p.address.village ?? "",
    houseStreet: p.address.houseStreet ?? "",
    coverageScheme: p.coverage.scheme,
    coverageMemberId: p.coverage.memberId ?? "",
    insurer: p.coverage.insurer ?? "",
    policyNumber: p.coverage.policyNumber ?? "",
    emergencyName: p.emergencyContact.name,
    emergencyRelationship: p.emergencyContact.relationship,
    emergencyPhone: p.emergencyContact.phone ? formatCambodianPhone(p.emergencyContact.phone) : "",
    bloodType: p.bloodType ?? "",
    allergies: p.allergies ?? "",
    medicalHistory: p.medicalHistory ?? "",
    currentMedications: p.currentMedications ?? "",
  };
}

/**
 * Matches a search term against Khmer name, Latin name (either order), hospital number,
 * QR code, phone (any format) and identity document number.
 */
export function patientMatches(p: Patient, rawQuery: string) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const phoneQuery = normalizeCambodianPhone(q) ?? q.replace(/[\s-]/g, "");
  const khmer = `${p.khmerName.family}${p.khmerName.given}`.replace(/\s/g, "");
  const haystack = [
    `${p.latinName.family} ${p.latinName.given}`,
    `${p.latinName.given} ${p.latinName.family}`,
    p.patientId,
    p.qrCode,
    p.identity.type === "none" ? "" : p.identity.number,
  ]
    .join(" | ")
    .toLowerCase();
  return (
    haystack.includes(q) ||
    khmer.includes(q.replace(/\s/g, "")) ||
    (phoneQuery.length >= 3 && p.phone.includes(phoneQuery))
  );
}
