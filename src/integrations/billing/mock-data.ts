import type { Invoice, InvoiceCoverage, InvoiceLine, InvoicePayment } from "./types";

/**
 * Demo invoices standing in for the billing system until its API exists.
 * Totals are derived from the lines so the sample data is always internally consistent.
 */

type Seed = Omit<Invoice, "lines" | "subtotal" | "patientPayable" | "amountPaid" | "balance" | "status"> & {
  lines: Omit<InvoiceLine, "amount">[];
  status?: Invoice["status"];
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function build(seed: Seed): Invoice {
  const lines = seed.lines.map((l) => ({ ...l, amount: round2(l.quantity * l.unitPrice) }));
  const subtotal = round2(lines.reduce((sum, l) => sum + l.amount, 0));
  const patientPayable = round2(Math.max(0, subtotal - seed.discount - (seed.coverage?.amount ?? 0)));
  const amountPaid = round2(seed.payments.reduce((sum, p) => sum + p.amount, 0));
  const balance = round2(Math.max(0, patientPayable - amountPaid));
  const status =
    seed.status ?? (balance === 0 ? "paid" : amountPaid > 0 ? "partially-paid" : "unpaid");
  return { ...seed, lines, subtotal, patientPayable, amountPaid, balance, status };
}

const nssf = (amount: number, memberId: string): InvoiceCoverage => ({
  scheme: "nssf",
  name: "NSSF Health Insurance",
  memberId,
  amount,
});

const pay = (p: Omit<InvoicePayment, "cashier"> & { cashier?: string }): InvoicePayment => ({
  cashier: "Cashier Sokha",
  ...p,
});

export const MOCK_INVOICES: Invoice[] = [
  build({
    id: "inv-1001",
    invoiceNumber: "INV-2026-001001",
    patientId: "PAT001",
    patientName: "John Smith",
    visitId: "VIS001",
    visitType: "opd",
    department: "Internal Medicine",
    issuedAt: "2026-10-02T09:40:00+07:00",
    exchangeRate: 4100,
    lines: [
      { id: "l1", category: "consultation", description: "General consultation", quantity: 1, unitPrice: 15 },
      { id: "l2", category: "laboratory", description: "Complete Blood Count (CBC)", quantity: 1, unitPrice: 8 },
      { id: "l3", category: "pharmacy", description: "Amlodipine 5mg (30 tabs)", quantity: 1, unitPrice: 6.5 },
    ],
    discount: 0,
    payments: [pay({ id: "p1", paidAt: "2026-10-02T10:05:00+07:00", method: "khqr", amount: 29.5, receiptNumber: "RC-88120" })],
  }),
  build({
    id: "inv-1002",
    invoiceNumber: "INV-2026-001187",
    patientId: "PAT001",
    patientName: "John Smith",
    visitId: "VIS014",
    visitType: "opd",
    department: "Radiology",
    issuedAt: "2026-11-04T14:15:00+07:00",
    exchangeRate: 4100,
    lines: [
      { id: "l1", category: "consultation", description: "Follow-up consultation", quantity: 1, unitPrice: 10 },
      { id: "l2", category: "radiology", description: "Abdominal ultrasound", quantity: 1, unitPrice: 25 },
      { id: "l3", category: "laboratory", description: "Liver function test", quantity: 1, unitPrice: 12 },
    ],
    discount: 2,
    coverage: nssf(20, "NSSF-0012-55821"),
    payments: [pay({ id: "p1", paidAt: "2026-11-04T14:30:00+07:00", method: "cash-khr", amount: 15, receiptNumber: "RC-90211" })],
  }),
  build({
    id: "inv-1003",
    invoiceNumber: "INV-2026-001240",
    patientId: "PAT001",
    patientName: "John Smith",
    visitId: "ADM003",
    visitType: "ipd",
    department: "Surgical Ward",
    issuedAt: "2026-11-11T08:00:00+07:00",
    exchangeRate: 4100,
    lines: [
      { id: "l1", category: "bed", description: "General ward bed (per day)", quantity: 3, unitPrice: 20 },
      { id: "l2", category: "nursing", description: "Nursing care (per day)", quantity: 3, unitPrice: 8 },
      { id: "l3", category: "procedure", description: "Wound debridement", quantity: 1, unitPrice: 60 },
      { id: "l4", category: "pharmacy", description: "Ceftriaxone 1g IV", quantity: 6, unitPrice: 3.5 },
    ],
    discount: 0,
    coverage: nssf(90, "NSSF-0012-55821"),
    payments: [],
    status: "insurance-pending",
  }),
  build({
    id: "inv-2001",
    invoiceNumber: "INV-2026-001195",
    patientId: "PAT002",
    patientName: "Mary Johnson",
    visitId: "VIS020",
    visitType: "emergency",
    department: "Emergency",
    issuedAt: "2026-11-06T22:10:00+07:00",
    exchangeRate: 4100,
    lines: [
      { id: "l1", category: "consultation", description: "Emergency assessment", quantity: 1, unitPrice: 20 },
      { id: "l2", category: "procedure", description: "Laceration suturing", quantity: 1, unitPrice: 30 },
      { id: "l3", category: "pharmacy", description: "Tetanus toxoid injection", quantity: 1, unitPrice: 5 },
    ],
    discount: 0,
    coverage: { scheme: "hef", name: "Health Equity Fund", memberId: "EQ-PP-204511", amount: 55 },
    payments: [],
  }),
  build({
    id: "inv-2002",
    invoiceNumber: "INV-2026-001233",
    patientId: "PAT002",
    patientName: "Mary Johnson",
    visitType: "pharmacy",
    department: "Pharmacy",
    issuedAt: "2026-11-10T11:20:00+07:00",
    exchangeRate: 4100,
    lines: [
      { id: "l1", category: "pharmacy", description: "Paracetamol 500mg (20 tabs)", quantity: 1, unitPrice: 2 },
      { id: "l2", category: "pharmacy", description: "Amoxicillin 500mg (21 caps)", quantity: 1, unitPrice: 4.5 },
    ],
    discount: 0,
    payments: [],
  }),
];
