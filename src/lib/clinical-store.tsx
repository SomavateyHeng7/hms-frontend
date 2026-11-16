"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAccess } from "@/lib/access";
import type { Permission } from "@/lib/permissions";
import type { Patient, Appointment, Visit, EHRRecord } from "@/types/patient";
import type { LabOrder, LabTest, LabTestResult, LabReport } from "@/types/laboratory";
import type { ImagingOrder } from "@/types/radiology";
import type { Prescription, OPDBilling } from "@/types/opd";
import type { LabOrderFormData, LabReportFormData, CriticalValueFormData } from "@/lib/validations/laboratory";
import type { ImagingOrderFormData } from "@/lib/validations/radiology";
import type { PrescriptionFormData, OPDBillingSubmission } from "@/lib/validations/opd";
import { mockPatients, mockAppointments, mockVisits, mockEHRRecords } from "@/mocks/patients";

/**
 * In-memory clinical data shared across modules (patients, lab, radiology, OPD),
 * so an order or prescription created in one module shows up on the patient's
 * timeline. Resets on page reload; replace with API calls once a backend exists.
 */

export type TimelineEventType =
  | "visit"
  | "appointment"
  | "lab_order"
  | "lab_result"
  | "imaging_order"
  | "prescription"
  | "record";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: Date;
  title: string;
  description?: string;
  status?: string;
  /** A critical lab value that has not yet been acknowledged */
  alert?: boolean;
  /** Module page where this item can be opened */
  href?: string;
}

export interface CriticalAcknowledgement {
  notifiedPerson: string;
  method: CriticalValueFormData["notificationMethod"];
  urgency: CriticalValueFormData["urgency"];
  notes?: string;
  acknowledgedAt: Date;
  acknowledgedBy: string;
}

export interface CriticalAlert {
  result: LabTestResult;
  patientName: string;
  patientId: string;
}

export type ValidateOutcome = "ok" | "denied" | "not_found" | "self_validation";

export const isCriticalResult = (r: LabTestResult) =>
  r.flag === "critical_high" || r.flag === "critical_low" || r.isCritical === true;

interface ClinicalData {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  visits: Visit[];
  setVisits: React.Dispatch<React.SetStateAction<Visit[]>>;
  ehrRecords: EHRRecord[];
  setEHRRecords: React.Dispatch<React.SetStateAction<EHRRecord[]>>;
  labOrders: LabOrder[];
  imagingOrders: ImagingOrder[];
  prescriptions: Prescription[];
  labResults: LabTestResult[];
  labReports: LabReport[];
  bills: OPDBilling[];
  criticalAcknowledgements: Record<string, CriticalAcknowledgement>;
  /** Critical lab results nobody has acknowledged yet, newest first */
  criticalAlerts: CriticalAlert[];
  addLabResult: (data: Partial<LabTestResult>) => LabTestResult | null;
  /**
   * Validates a result as the signed-in user. A result can't be validated by the person who
   * entered it (separation of duties).
   */
  validateLabResult: (resultId: string, comments?: string) => ValidateOutcome;
  acknowledgeCritical: (data: CriticalValueFormData) => boolean;
  addLabReport: (data: LabReportFormData) => LabReport | null;
  addBill: (data: OPDBillingSubmission, patientId: string) => OPDBilling | null;
  recordBillPayment: (billId: string, method: string, amount: number) => boolean;
  addLabOrder: (data: LabOrderFormData, tests: LabTest[]) => LabOrder | null;
  cancelLabOrder: (id: string) => boolean;
  addImagingOrder: (data: ImagingOrderFormData) => ImagingOrder | null;
  addPrescription: (
    data: PrescriptionFormData,
    patientId: string,
    meta?: { overriddenWarnings: string[] }
  ) => Prescription | null;
  getPatient: (id: string) => Patient | undefined;
  getTimeline: (patientId: string) => TimelineEvent[];
}

const ClinicalDataContext = createContext<ClinicalData | null>(null);

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++counter}`;

export function ClinicalDataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [ehrRecords, setEHRRecords] = useState<EHRRecord[]>(mockEHRRecords);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [imagingOrders, setImagingOrders] = useState<ImagingOrder[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabTestResult[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [bills, setBills] = useState<OPDBilling[]>([]);
  const [criticalAcknowledgements, setCriticalAcknowledgements] = useState<Record<string, CriticalAcknowledgement>>({});

  const { user, can, log } = useAccess();
  // The signed-in staff member, recorded as the author of everything created below
  const actor = useMemo(
    () => ({
      id: user?.id ?? "unknown",
      name: user?.name ?? "Unknown user",
      department: user?.department ?? "",
      license: user?.license ?? "",
    }),
    [user]
  );

  /** Permission check that records a denied attempt in the audit log. */
  const allow = useCallback(
    (permission: Permission, what: string) => {
      if (can(permission)) return true;
      log({
        action: "access.denied",
        summary: `Not permitted to ${what}`,
        details: [`Missing permission: ${permission}`],
      });
      return false;
    },
    [can, log]
  );

  const getPatient = useCallback((id: string) => patients.find((p) => p.id === id), [patients]);

  const addLabOrder = useCallback(
    (data: LabOrderFormData, tests: LabTest[]) => {
      if (!allow("labOrder.create", "create a lab order")) return null;
      const patient = patients.find((p) => p.id === data.patientId);
      if (!patient) return null;
      const selected = tests.filter((t) => data.tests.includes(t.id));
      const order: LabOrder = {
        id: nextId("LAB"),
        orderNumber: `LAB${String(labOrders.length + 1).padStart(5, "0")}`,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientMRN: patient.patientId,
        patientDOB: patient.dateOfBirth,
        patientGender: patient.gender,
        orderingPhysician: { id: actor.id, name: actor.name, department: actor.department, license: actor.license },
        tests: selected.map((t) => ({
          testId: t.id,
          testName: t.name,
          testCode: t.code,
          status: "pending" as const,
        })),
        priority: data.priority,
        clinicalIndication: data.clinicalIndication,
        notes: data.notes,
        status: "ordered",
        orderDate: new Date(),
        fastingRequired: data.fastingRequired,
        totalAmount: selected.reduce((sum, t) => sum + t.price, 0),
      };
      setLabOrders((prev) => [order, ...prev]);
      log({
        action: "lab_order.create",
        entityType: "lab_order",
        entityId: order.orderNumber,
        patientId: patient.id,
        patientName: order.patientName,
        summary: `Ordered ${order.tests.length} test(s) (${order.priority}): ${order.tests.map((t) => t.testCode).join(", ")}`,
      });
      return order;
    },
    [patients, labOrders.length, allow, actor, log]
  );

  const cancelLabOrder = useCallback(
    (id: string) => {
      if (!allow("labOrder.cancel", "cancel a lab order")) return false;
      const order = labOrders.find((o) => o.id === id);
      if (!order) return false;
      setLabOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as const } : o)));
      log({
        action: "lab_order.cancel",
        entityType: "lab_order",
        entityId: order.orderNumber,
        patientId: order.patientId,
        patientName: order.patientName,
        summary: `Cancelled lab order ${order.orderNumber}`,
      });
      return true;
    },
    [allow, labOrders, log]
  );

  const addImagingOrder = useCallback(
    (data: ImagingOrderFormData) => {
      if (!allow("imagingOrder.create", "create an imaging order")) return null;
      const patient = patients.find((p) => p.id === data.patientId);
      if (!patient) return null;
      const now = new Date();
      const order: ImagingOrder = {
        id: nextId("IMG"),
        orderNumber: `IMG${String(imagingOrders.length + 1).padStart(5, "0")}`,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientMRN: patient.patientId,
        orderingPhysician: { id: actor.id, name: actor.name, department: actor.department, license: actor.license },
        imagingType: data.imagingType,
        examType: data.examType,
        bodyPart: data.bodyPart,
        clinicalIndication: data.clinicalIndication,
        urgency: data.urgency,
        contrast: data.contrast,
        estimatedDuration: 30,
        specialInstructions: data.specialInstructions,
        preparationInstructions: data.preparationInstructions,
        status: "ordered",
        orderDate: now,
        createdBy: actor.id,
        createdAt: now,
        updatedAt: now,
      };
      setImagingOrders((prev) => [order, ...prev]);
      log({
        action: "imaging_order.create",
        entityType: "imaging_order",
        entityId: order.orderNumber,
        patientId: patient.id,
        patientName: order.patientName,
        summary: `Ordered ${order.examType} (${order.bodyPart}), ${order.urgency}`,
      });
      return order;
    },
    [patients, imagingOrders.length, allow, actor, log]
  );

  const addPrescription = useCallback(
    (data: PrescriptionFormData, patientId: string, meta?: { overriddenWarnings: string[] }) => {
      if (!allow("prescription.create", "create a prescription")) return null;
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) return null;
      const now = new Date();
      const validUntil = new Date(now);
      validUntil.setDate(validUntil.getDate() + 30);
      const prescription: Prescription = {
        id: nextId("RX"),
        prescriptionNumber: `RX${String(prescriptions.length + 1).padStart(5, "0")}`,
        patientId,
        consultationId: "",
        doctorId: actor.id,
        doctorName: actor.name,
        licenseNumber: actor.license,
        medications: data.medications.map((m) => ({
          id: nextId("MED"),
          name: m.name,
          genericName: m.genericName,
          strength: m.dosage,
          dosageForm: "tablet" as const,
          quantity: m.quantity,
          dosage: m.dosage,
          frequency: m.frequency,
          route: m.route === "injection" ? ("im" as const) : m.route,
          duration: m.duration,
          instructions: m.instructions ?? "",
          substitutionAllowed: true,
          refills: 0,
          remainingRefills: 0,
        })),
        instructions: data.notes ?? "",
        duration: data.medications[0]?.duration ?? "",
        status: data.status,
        type: data.type,
        priority: data.priority,
        prescribedBy: actor.name,
        notes: data.notes,
        pharmacyNotes: meta?.overriddenWarnings?.length
          ? `Safety warnings acknowledged by ${actor.name}: ${meta.overriddenWarnings.join(" | ")}`
          : undefined,
        issuedDate: now,
        validUntil,
        createdAt: now,
        updatedAt: now,
      };
      setPrescriptions((prev) => [prescription, ...prev]);
      const patientName = `${patient.firstName} ${patient.lastName}`;
      log({
        action: "prescription.create",
        entityType: "prescription",
        entityId: prescription.prescriptionNumber,
        patientId: patient.id,
        patientName,
        summary: `Prescribed ${prescription.medications.map((m) => m.name).join(", ")}`,
      });
      if (meta?.overriddenWarnings?.length) {
        log({
          action: "prescription.safety_override",
          entityType: "prescription",
          entityId: prescription.prescriptionNumber,
          patientId: patient.id,
          patientName,
          summary: `Prescribed despite ${meta.overriddenWarnings.length} safety warning(s)`,
          details: meta.overriddenWarnings,
        });
      }
      return prescription;
    },
    [patients, prescriptions.length, allow, actor, log]
  );

  const findOrder = useCallback(
    (ref: string) => labOrders.find((o) => o.id === ref || o.orderNumber.toLowerCase() === ref.trim().toLowerCase()),
    [labOrders]
  );

  const addLabResult = useCallback(
    (data: Partial<LabTestResult>) => {
      if (!allow("labResult.enter", "enter a lab result")) return null;
      const order = data.orderId ? findOrder(data.orderId) : undefined;
      if (!order) return null;
      const result: LabTestResult = {
        id: nextId("RES"),
        testComponentId: data.testComponentId ?? data.testCode ?? "",
        componentName: data.componentName ?? data.testCode ?? "",
        value: data.value ?? "",
        unit: data.unit ?? "",
        normalRange: data.normalRange ?? data.referenceRange ?? "",
        flag: data.flag ?? "normal",
        status: data.status ?? "preliminary",
        enteredBy: actor.name,
        enteredById: actor.id,
        enteredAt: new Date(),
        notes: data.notes,
        orderId: order.id,
        testCode: data.testCode ?? "",
        referenceRange: data.referenceRange,
        method: data.method,
        comments: data.comments,
        isCritical: data.isCritical,
        patientId: order.patientId,
      };
      setLabResults((prev) => [result, ...prev]);
      log({
        action: "lab_result.enter",
        entityType: "lab_result",
        entityId: `${order.orderNumber}/${result.testCode}`,
        patientId: order.patientId,
        patientName: order.patientName,
        summary: `Entered ${result.testCode} = ${result.value} ${result.unit} (${String(result.flag).replace("_", " ")})`,
      });
      return result;
    },
    [findOrder, allow, actor, log]
  );

  const validateLabResult = useCallback(
    (resultId: string, comments?: string): ValidateOutcome => {
      if (!allow("labResult.validate", "validate a lab result")) return "denied";
      const result = labResults.find((r) => r.id === resultId);
      if (!result) return "not_found";
      // Separation of duties: a second person must verify the result
      if (result.enteredById && result.enteredById === actor.id) {
        log({
          action: "access.denied",
          summary: "Blocked self-validation of a lab result",
          entityType: "lab_result",
          entityId: `${result.orderId}/${result.testCode}`,
          patientId: result.patientId,
          details: ["The person who entered a result cannot validate it."],
        });
        return "self_validation";
      }
      setLabResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? { ...r, status: "final" as const, validatedBy: actor.name, validatedAt: new Date(), validationComments: comments }
            : r
        )
      );
      const patient = patients.find((p) => p.id === result.patientId);
      log({
        action: "lab_result.validate",
        entityType: "lab_result",
        entityId: `${result.orderId}/${result.testCode}`,
        patientId: result.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : undefined,
        summary: `Validated ${result.testCode} = ${result.value} ${result.unit}`,
      });
      return "ok";
    },
    [allow, labResults, actor, patients, log]
  );

  const acknowledgeCritical = useCallback(
    (data: CriticalValueFormData) => {
      if (!allow("criticalValue.acknowledge", "acknowledge a critical value")) return false;
      const result = labResults.find((r) => r.id === data.resultId);
      if (!result) return false;
      setCriticalAcknowledgements((prev) => ({
        ...prev,
        [data.resultId]: {
          notifiedPerson: data.notifiedPerson,
          method: data.notificationMethod,
          urgency: data.urgency,
          notes: data.notificationNotes,
          acknowledgedAt: new Date(),
          acknowledgedBy: actor.name,
        },
      }));
      const patient = patients.find((p) => p.id === result.patientId);
      log({
        action: "critical_value.acknowledge",
        entityType: "lab_result",
        entityId: `${result.orderId}/${result.testCode}`,
        patientId: result.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : undefined,
        summary: `Recorded notification of ${data.notifiedPerson} by ${data.notificationMethod} for ${result.testCode} ${result.value} ${result.unit}`,
      });
      return true;
    },
    [allow, labResults, actor, patients, log]
  );

  const addLabReport = useCallback(
    (data: LabReportFormData) => {
      if (!allow("labReport.create", "create a lab report")) return null;
      const order = findOrder(data.orderId);
      if (!order) return null;
      const orderResults = labResults.filter((r) => r.orderId === order.id);
      const now = new Date();
      const report: LabReport = {
        id: nextId("REP"),
        reportNumber: `LR${String(labReports.length + 1).padStart(5, "0")}`,
        orderId: order.id,
        patientId: order.patientId,
        patientName: order.patientName,
        patientMRN: order.patientMRN,
        patientDOB: order.patientDOB,
        patientGender: order.patientGender,
        orderingPhysician: { name: order.orderingPhysician.name, department: order.orderingPhysician.department },
        tests: order.tests.map((t) => ({
          testId: t.testId,
          testName: t.testName,
          testCode: t.testCode,
          methodology: "",
          sampleType: "",
          collectionDate: order.collectionDate ?? order.orderDate,
          results: orderResults.filter((r) => r.testCode === t.testCode),
          referenceRanges: "",
        })),
        reportDate: now,
        status: orderResults.length > 0 && orderResults.every((r) => r.status === "final") ? "final" : "preliminary",
        technologist: { id: actor.id, name: actor.name, license: actor.license },
        clinicalIndication: order.clinicalIndication,
        criticalValues: orderResults.some(isCriticalResult),
        notificationSent: false,
        deliveryMethod: data.deliveryMethod,
        template: data.template,
        generatedAt: now,
        generatedBy: data.generatedBy,
        comments: data.comments,
      };
      setLabReports((prev) => [report, ...prev]);
      log({
        action: "lab_report.create",
        entityType: "lab_report",
        entityId: report.reportNumber,
        patientId: order.patientId,
        patientName: order.patientName,
        summary: `Generated ${report.status} lab report ${report.reportNumber} for order ${order.orderNumber}`,
      });
      return report;
    },
    [findOrder, labResults, labReports.length, allow, actor, log]
  );

  const addBill = useCallback(
    (data: OPDBillingSubmission, patientId: string) => {
      if (!allow("bill.create", "create a bill")) return null;
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) return null;
      const now = new Date();
      const due = new Date(now);
      due.setDate(due.getDate() + 30);
      const bill: OPDBilling = {
        id: nextId("BILL"),
        billNumber: `BL${String(bills.length + 1).padStart(5, "0")}`,
        patientId,
        visitId: "",
        billDate: now,
        dueDate: due,
        items: data.items,
        subtotal: data.subtotal,
        discounts: [],
        totalDiscount: data.discountAmount,
        taxes: [],
        totalTax: data.taxAmount,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        balanceAmount: data.totalAmount,
        status: data.status,
        paymentStatus: data.paymentStatus,
        discount: data.discount,
        discountAmount: data.discountAmount,
        taxRate: data.taxRate,
        taxAmount: data.taxAmount,
        notes: data.notes,
        createdBy: actor.id,
        createdAt: now,
        updatedAt: now,
      };
      setBills((prev) => [bill, ...prev]);
      log({
        action: "bill.create",
        entityType: "bill",
        entityId: bill.billNumber,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        summary: `Created bill ${bill.billNumber} for $${bill.totalAmount.toFixed(2)}`,
      });
      return bill;
    },
    [patients, bills.length, allow, actor, log]
  );

  const recordBillPayment = useCallback(
    (billId: string, method: string, amount: number) => {
      if (!allow("bill.payment", "record a payment")) return false;
      const bill = bills.find((b) => b.id === billId);
      if (!bill || !(amount > 0)) return false;
      setBills((prev) =>
        prev.map((b) => {
          if (b.id !== billId) return b;
          const paidAmount = Math.min(b.paidAmount + amount, b.totalAmount);
          const balanceAmount = b.totalAmount - paidAmount;
          return {
            ...b,
            paidAmount,
            balanceAmount,
            paymentMethod: method as OPDBilling["paymentMethod"],
            paymentStatus: balanceAmount <= 0 ? ("paid" as const) : ("partial" as const),
            status: balanceAmount <= 0 ? ("paid" as const) : ("partial" as const),
            updatedAt: new Date(),
          };
        })
      );
      const patient = patients.find((p) => p.id === bill.patientId);
      log({
        action: "bill.payment",
        entityType: "bill",
        entityId: bill.billNumber,
        patientId: bill.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : undefined,
        summary: `Recorded $${amount.toFixed(2)} payment (${method}) on bill ${bill.billNumber}`,
      });
      return true;
    },
    [allow, bills, patients, log]
  );

  const criticalAlerts = useMemo<CriticalAlert[]>(
    () =>
      labResults
        .filter((r) => isCriticalResult(r) && !criticalAcknowledgements[r.id])
        .map((result) => {
          const patient = patients.find((p) => p.id === result.patientId);
          return {
            result,
            patientId: result.patientId ?? "",
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown patient",
          };
        }),
    [labResults, criticalAcknowledgements, patients]
  );

  const getTimeline = useCallback(
    (patientId: string): TimelineEvent[] => {
      // Visits, appointments and EHR records are keyed by the display ID (e.g. "PAT001");
      // orders and prescriptions created in this session are keyed by the internal patient id.
      const displayId = patients.find((p) => p.id === patientId)?.patientId ?? patientId;
      const events: TimelineEvent[] = [
        ...visits
          .filter((v) => v.patientId === displayId)
          .map<TimelineEvent>((v) => ({
            id: `visit-${v.id}`,
            type: "visit",
            date: new Date(v.visitDate),
            title: `Visit: ${v.chiefComplaint}`,
            description: [v.diagnosis, `${v.doctorName} · ${v.department}`].filter(Boolean).join(" — "),
          })),
        ...appointments
          .filter((a) => a.patientId === displayId)
          .map<TimelineEvent>((a) => ({
            id: `appt-${a.id}`,
            type: "appointment",
            date: new Date(a.appointmentDate),
            title: `Appointment: ${a.reason}`,
            description: `${a.doctorName} · ${a.department} · ${a.appointmentTime}`,
            status: a.status,
            href: "/scheduling",
          })),
        ...ehrRecords
          .filter((r) => r.patientId === displayId)
          .map<TimelineEvent>((r) => ({
            id: `ehr-${r.id}`,
            type: "record",
            date: new Date(r.date),
            title: r.title,
            description: r.description,
          })),
        ...labOrders
          .filter((o) => o.patientId === patientId)
          .map<TimelineEvent>((o) => ({
            id: `lab-${o.id}`,
            type: "lab_order",
            date: o.orderDate,
            title: `Lab order ${o.orderNumber}`,
            description: o.tests.map((t) => t.testName).join(", "),
            status: o.status,
            href: `/laboratory?tab=orders&patient=${patientId}`,
          })),
        ...labResults
          .filter((r) => r.patientId === patientId)
          .map<TimelineEvent>((r) => {
            const ack = criticalAcknowledgements[r.id];
            const critical = isCriticalResult(r);
            return {
              id: `res-${r.id}`,
              type: "lab_result",
              date: r.enteredAt,
              title: `Result: ${r.testCode} ${r.value} ${r.unit}`.trim(),
              description: critical
                ? ack
                  ? `Critical value — ${ack.notifiedPerson} notified by ${ack.method} (recorded by ${ack.acknowledgedBy})`
                  : "Critical value — provider notification pending"
                : r.componentName,
              status: critical ? r.flag.replace("_", " ") : r.status,
              alert: critical && !ack,
              href: `/laboratory?tab=results&patient=${patientId}`,
            };
          }),
        ...imagingOrders
          .filter((o) => o.patientId === patientId)
          .map<TimelineEvent>((o) => ({
            id: `img-${o.id}`,
            type: "imaging_order",
            date: o.orderDate,
            title: `Imaging order ${o.orderNumber}`,
            description: `${o.examType} (${o.bodyPart})`,
            status: o.status,
            href: `/radiology?tab=orders&patient=${patientId}`,
          })),
        ...prescriptions
          .filter((p) => p.patientId === patientId)
          .map<TimelineEvent>((p) => ({
            id: `rx-${p.id}`,
            type: "prescription",
            date: p.issuedDate,
            title: `Prescription ${p.prescriptionNumber}`,
            description: p.medications.map((m) => m.name).join(", "),
            status: p.status,
            href: `/opd?tab=prescription&patient=${patientId}`,
          })),
      ];
      // Roles without clinical access (front desk, billing) only see appointments
      const visible = can("patient.viewClinical") ? events : events.filter((e) => e.type === "appointment");
      return visible.sort((a, b) => b.date.getTime() - a.date.getTime());
    },
    [can, patients, visits, appointments, ehrRecords, labOrders, labResults, criticalAcknowledgements, imagingOrders, prescriptions]
  );

  const value = useMemo<ClinicalData>(
    () => ({
      patients,
      setPatients,
      appointments,
      setAppointments,
      visits,
      setVisits,
      ehrRecords,
      setEHRRecords,
      labOrders,
      imagingOrders,
      prescriptions,
      labResults,
      labReports,
      bills,
      criticalAcknowledgements,
      criticalAlerts,
      addLabResult,
      validateLabResult,
      acknowledgeCritical,
      addLabReport,
      addBill,
      recordBillPayment,
      addLabOrder,
      cancelLabOrder,
      addImagingOrder,
      addPrescription,
      getPatient,
      getTimeline,
    }),
    [
      patients,
      appointments,
      visits,
      ehrRecords,
      labOrders,
      imagingOrders,
      prescriptions,
      labResults,
      labReports,
      bills,
      criticalAcknowledgements,
      criticalAlerts,
      addLabResult,
      validateLabResult,
      acknowledgeCritical,
      addLabReport,
      addBill,
      recordBillPayment,
      addLabOrder,
      cancelLabOrder,
      addImagingOrder,
      addPrescription,
      getPatient,
      getTimeline,
    ]
  );

  return <ClinicalDataContext.Provider value={value}>{children}</ClinicalDataContext.Provider>;
}

export function useClinicalData(): ClinicalData {
  const ctx = useContext(ClinicalDataContext);
  if (!ctx) throw new Error("useClinicalData must be used within a ClinicalDataProvider");
  return ctx;
}
