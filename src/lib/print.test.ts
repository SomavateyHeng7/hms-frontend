import { describe, expect, it } from "vitest";
import { billHtml, escapeHtml, labReportHtml, prescriptionHtml } from "./print";
import type { Patient } from "@/types/patient";
import type { Prescription, OPDBilling } from "@/types/opd";
import type { LabReport } from "@/types/laboratory";

const patient = {
  id: "1",
  patientId: "PAT001",
  firstName: "John",
  lastName: "<b>Smith</b>",
  dateOfBirth: new Date("1985-03-15"),
  gender: "male",
  bloodType: "O+",
  allergies: "Penicillin",
} as Patient;

describe("escapeHtml", () => {
  it("escapes markup characters", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;"
    );
  });
  it("handles null and numbers", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(42)).toBe("42");
  });
});

describe("prescriptionHtml", () => {
  const rx = {
    prescriptionNumber: "RX00001",
    issuedDate: new Date("2026-11-16"),
    validUntil: new Date("2026-12-16"),
    doctorName: "Dr. Sarah Johnson",
    licenseNumber: "MD12345",
    notes: "Take with food",
    pharmacyNotes: "Safety warnings acknowledged by prescriber: Amoxicillin — allergy",
    medications: [
      { name: "Amoxicillin", genericName: "Amoxicillin", dosage: "500mg", frequency: "TID", duration: "7 days", quantity: 21, route: "oral", instructions: "" },
    ],
  } as unknown as Prescription;

  it("includes patient, allergies, medications and the override note", () => {
    const html = prescriptionHtml(rx, patient);
    expect(html).toContain("RX00001");
    expect(html).toContain("Penicillin");
    expect(html).toContain("Amoxicillin");
    expect(html).toContain("Safety warnings acknowledged");
  });
  it("escapes patient-supplied markup", () => {
    const html = prescriptionHtml(rx, patient);
    expect(html).not.toContain("<b>Smith</b>");
    expect(html).toContain("&lt;b&gt;Smith&lt;/b&gt;");
  });
});

describe("labReportHtml", () => {
  const report = {
    reportNumber: "LR00001",
    patientName: "John Smith",
    patientMRN: "PAT001",
    patientDOB: new Date("1985-03-15"),
    patientGender: "male",
    orderingPhysician: { name: "Dr. A", department: "GM" },
    clinicalIndication: "Checkup",
    criticalValues: true,
    reportDate: new Date(),
    status: "preliminary",
    technologist: { id: "T", name: "Tech", license: "L" },
    tests: [
      {
        testName: "Potassium", testCode: "K",
        results: [{ componentName: "K", value: 6.8, unit: "mmol/L", flag: "critical_high", status: "preliminary", normalRange: "3.5-5.0", testCode: "K" }],
      },
    ],
  } as unknown as LabReport;

  it("marks critical values", () => {
    const html = labReportHtml(report);
    expect(html).toContain("critical values");
    expect(html).toContain("critical high");
    expect(html).toContain('class="critical"');
  });
});

describe("billHtml", () => {
  const bill = {
    billNumber: "BL00001",
    billDate: new Date(), dueDate: new Date(),
    paymentStatus: "pending",
    items: [{ serviceCode: "CONS", description: "Consultation", quantity: 2, unitPrice: 50, discount: 10, taxRate: 0 }],
    subtotal: 90, discount: 0, discountAmount: 0, taxRate: 10, taxAmount: 9, totalAmount: 99, paidAmount: 0, balanceAmount: 99,
  } as unknown as OPDBilling;

  it("computes line amounts net of discount and shows totals", () => {
    const html = billHtml(bill, patient);
    expect(html).toContain("$90.00");
    expect(html).toContain("$99.00");
    expect(html).not.toContain("Discount (");
  });
});
