/**
 * Read-only invoice contract between the HMS frontend and the external billing system.
 *
 * The billing system (in development) owns pricing, payments and insurance claims.
 * The HMS only displays invoices. Dates are ISO-8601 strings and amounts are in USD,
 * matching what a JSON API will return; KHR is derived using `exchangeRate`.
 */

export type InvoiceStatus = "draft" | "unpaid" | "partially-paid" | "paid" | "insurance-pending" | "cancelled";

export type VisitType = "opd" | "ipd" | "emergency" | "pharmacy";

export type CoverageScheme = "nssf" | "hef" | "private-insurance" | "corporate";

export type PaymentMethod = "cash-usd" | "cash-khr" | "khqr" | "card" | "bank-transfer";

export type InvoiceLineCategory =
  | "consultation"
  | "laboratory"
  | "radiology"
  | "pharmacy"
  | "procedure"
  | "bed"
  | "nursing"
  | "other";

export interface InvoiceLine {
  id: string;
  category: InvoiceLineCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceCoverage {
  scheme: CoverageScheme;
  /** Display name, e.g. "NSSF Health Insurance" or the insurer's name. */
  name: string;
  memberId?: string;
  amount: number;
}

export interface InvoicePayment {
  id: string;
  paidAt: string;
  method: PaymentMethod;
  amount: number;
  receiptNumber: string;
  cashier: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  visitId?: string;
  visitType: VisitType;
  department: string;
  issuedAt: string;
  /** KHR per 1 USD on the day the invoice was issued. */
  exchangeRate: number;
  lines: InvoiceLine[];
  subtotal: number;
  discount: number;
  coverage?: InvoiceCoverage;
  /** subtotal - discount - coverage */
  patientPayable: number;
  amountPaid: number;
  balance: number;
  payments: InvoicePayment[];
  status: InvoiceStatus;
  /** Deep link into the billing system for cashiers, once it exists. */
  externalUrl?: string;
}
