/**
 * Every feature module in the HMS, in one place, so the Admin Console can show what exists,
 * how far along it is, and switch modules on or off per hospital.
 *
 * `maturity` tells reviewers what they are looking at during the prototype:
 *   - "connected": works on the shared data layer; changes are saved and shown across screens.
 *   - "prototype": screens are designed but use fixed sample data; nothing is saved yet.
 */

export type ModuleId =
  | "patients"
  | "queue"
  | "scheduling"
  | "opd"
  | "medical-records"
  | "inpatient"
  | "emergency"
  | "operation-theater"
  | "laboratory"
  | "radiology"
  | "blood-bank"
  | "cssd"
  | "diet"
  | "ambulance"
  | "staff"
  | "reporting";

export type ModuleArea = "front-desk" | "doctor" | "nursing" | "diagnostics" | "support" | "admin";
export type ModuleMaturity = "connected" | "prototype";

export interface SystemModule {
  id: ModuleId;
  name: string;
  description: string;
  area: ModuleArea;
  href: string;
  maturity: ModuleMaturity;
  /** Core modules cannot be switched off: other modules depend on them. */
  core?: boolean;
}

export const AREA_LABELS: Record<ModuleArea, string> = {
  "front-desk": "Front desk",
  doctor: "Doctors",
  nursing: "Nursing & wards",
  diagnostics: "Diagnostics",
  support: "Support services",
  admin: "Administration",
};

export const MODULES: SystemModule[] = [
  { id: "patients", name: "Patients", description: "Registration, check-in, patient record, consents and invoices", area: "front-desk", href: "/front-desk/patients", maturity: "connected", core: true },
  { id: "queue", name: "Queue", description: "Tokens, counters and waiting lists", area: "front-desk", href: "/front-desk/queue", maturity: "prototype" },
  { id: "scheduling", name: "Scheduling", description: "Appointments, rosters, reminders and telemedicine", area: "front-desk", href: "/front-desk/scheduling", maturity: "prototype" },
  { id: "opd", name: "OPD", description: "Outpatient consultation, diagnosis and prescriptions", area: "doctor", href: "/doctor/opd", maturity: "prototype" },
  { id: "medical-records", name: "Medical Records", description: "Patient records, documents and consent forms", area: "doctor", href: "/doctor/medical-records", maturity: "connected", core: true },
  { id: "inpatient", name: "Inpatient (IPD)", description: "Admissions, beds and vital signs", area: "nursing", href: "/nursing/inpatient", maturity: "prototype" },
  { id: "emergency", name: "Emergency", description: "Triage, active cases and ER beds", area: "nursing", href: "/nursing/emergency", maturity: "prototype" },
  { id: "operation-theater", name: "Operation Theater", description: "Surgery schedule and theaters", area: "nursing", href: "/nursing/operation-theater", maturity: "prototype" },
  { id: "laboratory", name: "Laboratory", description: "Lab orders, samples, results and critical values", area: "diagnostics", href: "/diagnostics/laboratory", maturity: "prototype" },
  { id: "radiology", name: "Radiology", description: "Imaging orders, scheduling, studies and reports", area: "diagnostics", href: "/diagnostics/radiology", maturity: "prototype" },
  { id: "blood-bank", name: "Blood Bank", description: "Donors, blood stock and requests", area: "diagnostics", href: "/diagnostics/blood-bank", maturity: "prototype" },
  { id: "cssd", name: "CSSD", description: "Sterilization cycles, packs and equipment", area: "support", href: "/support/cssd", maturity: "prototype" },
  { id: "diet", name: "Diet & Nutrition", description: "Diet orders, meal service and assessments", area: "support", href: "/support/diet", maturity: "prototype" },
  { id: "ambulance", name: "Ambulance", description: "Trips, fleet and requests", area: "support", href: "/support/ambulance", maturity: "prototype" },
  { id: "staff", name: "Staff", description: "Staff register and leave", area: "admin", href: "/admin/staff", maturity: "prototype" },
  { id: "reporting", name: "Reporting", description: "Census and clinical reports", area: "admin", href: "/admin/reporting", maturity: "prototype" },
];

export type IntegrationStatus = "sample-data" | "not-connected";

export interface ExternalSystem {
  id: "billing" | "pharmacy" | "inventory";
  name: string;
  role: string;
  direction: string;
  status: IntegrationStatus;
}

/** Billing, pharmacy and inventory are separate systems; the HMS only reads from or prints for them. */
export const EXTERNAL_SYSTEMS: ExternalSystem[] = [
  { id: "billing", name: "Billing", role: "Shows a patient's invoices, read-only, on the patient record", direction: "Billing → HMS (read)", status: "sample-data" },
  { id: "pharmacy", name: "Pharmacy", role: "Prescriptions are recorded and printed in the HMS; nothing is sent yet", direction: "HMS → Pharmacy (planned)", status: "not-connected" },
  { id: "inventory", name: "Inventory", role: "Managed in its own system; not shown in the HMS", direction: "None", status: "not-connected" },
];
