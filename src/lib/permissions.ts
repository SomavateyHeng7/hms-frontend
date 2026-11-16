/**
 * Role-based access control for the demo app.
 *
 * NOTE: this runs entirely in the browser, so it is a UI/workflow safeguard only.
 * Real enforcement must happen on a server that authenticates users and checks the
 * same rules on every request.
 */

export const ROLES = [
  "doctor",
  "nurse",
  "lab_technician",
  "radiologist",
  "receptionist",
  "billing",
  "admin",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  doctor: "Doctor",
  nurse: "Nurse",
  lab_technician: "Lab Technician",
  radiologist: "Radiologist",
  receptionist: "Receptionist",
  billing: "Billing Officer",
  admin: "Administrator",
};

export type Module = "patients" | "opd" | "laboratory" | "radiology" | "scheduling" | "reporting" | "audit";

export type Permission =
  | `module.${Module}`
  | "patient.register"
  | "patient.edit"
  | "visit.record"
  /** See clinical data (results, prescriptions, orders). Without it only demographics and appointments. */
  | "patient.viewClinical"
  | "prescription.create"
  | "prescription.print"
  | "labOrder.create"
  | "labOrder.cancel"
  | "labResult.enter"
  | "labResult.validate"
  | "labReport.create"
  | "labReport.print"
  | "criticalValue.acknowledge"
  | "imagingOrder.create"
  | "bill.create"
  | "bill.payment"
  | "bill.print"
  | "appointment.book"
  | "audit.view";

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  doctor: [
    "module.patients", "module.opd", "module.laboratory", "module.radiology", "module.scheduling", "module.reporting",
    "patient.edit", "patient.viewClinical", "visit.record",
    "prescription.create", "prescription.print",
    "labOrder.create", "labOrder.cancel", "labReport.print",
    "criticalValue.acknowledge",
    "imagingOrder.create",
    "appointment.book",
  ],
  nurse: [
    "module.patients", "module.opd", "module.laboratory", "module.radiology", "module.scheduling",
    "patient.register", "patient.edit", "patient.viewClinical", "visit.record",
    "prescription.print", "labReport.print",
    "criticalValue.acknowledge",
    "appointment.book",
  ],
  lab_technician: [
    "module.patients", "module.laboratory",
    "patient.viewClinical",
    "labResult.enter", "labResult.validate", "labReport.create", "labReport.print",
    "criticalValue.acknowledge",
  ],
  radiologist: ["module.patients", "module.radiology", "patient.viewClinical"],
  receptionist: [
    "module.patients", "module.opd", "module.scheduling",
    "patient.register", "patient.edit",
    "appointment.book",
  ],
  billing: [
    "module.patients", "module.opd", "module.reporting",
    "bill.create", "bill.payment", "bill.print",
  ],
  admin: ["module.patients", "module.reporting", "module.audit", "audit.view"],
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
  return !!role && ROLE_PERMISSIONS[role].includes(permission);
}

/** Maps a URL path to the governed module it belongs to (undefined = not governed). */
export function moduleForPath(pathname: string): Module | undefined {
  const first = pathname.split("/").filter(Boolean)[0];
  switch (first) {
    case "patients": return "patients";
    case "opd": return "opd";
    case "laboratory": return "laboratory";
    case "radiology": return "radiology";
    case "scheduling": return "scheduling";
    case "reporting": return "reporting";
    case "audit": return "audit";
    default: return undefined;
  }
}

export function canAccessPath(role: Role | null | undefined, pathname: string): boolean {
  const module = moduleForPath(pathname);
  return module ? can(role, `module.${module}`) : true;
}

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  department: string;
  license: string;
}

/** Demo staff accounts. Two lab technicians exist so separation of duties can be exercised. */
export const DEMO_USERS: DemoUser[] = [
  { id: "U-DOC-1", name: "Dr. Sarah Johnson", role: "doctor", department: "General Medicine", license: "MD12345" },
  { id: "U-DOC-2", name: "Dr. Michael Chen", role: "doctor", department: "Cardiology", license: "MD12346" },
  { id: "U-NUR-1", name: "Priya Patel, RN", role: "nurse", department: "General Medicine", license: "RN55120" },
  { id: "U-LAB-1", name: "Mike Rodriguez", role: "lab_technician", department: "Laboratory", license: "MLT40211" },
  { id: "U-LAB-2", name: "Lisa Wong", role: "lab_technician", department: "Laboratory", license: "MLT40388" },
  { id: "U-RAD-1", name: "Dr. Emily Chen", role: "radiologist", department: "Radiology", license: "RAD12345" },
  { id: "U-REC-1", name: "Rita Alvarez", role: "receptionist", department: "Front Desk", license: "" },
  { id: "U-BIL-1", name: "Ben Carter", role: "billing", department: "Finance", license: "" },
  { id: "U-ADM-1", name: "Alex Admin", role: "admin", department: "Administration", license: "" },
];

export const findDemoUser = (id: string | null | undefined) => DEMO_USERS.find((u) => u.id === id);
