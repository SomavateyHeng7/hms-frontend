import type { CoverageScheme, InvoiceStatus, PaymentMethod, VisitType } from "./types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const khr = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatUSD(amount: number) {
  return usd.format(amount);
}

/** Riel is rounded to the nearest 100, the smallest note in common use. */
export function formatKHR(amountUSD: number, exchangeRate: number) {
  return `៛${khr.format(Math.round((amountUSD * exchangeRate) / 100) * 100)}`;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  unpaid: "Unpaid",
  "partially-paid": "Partially Paid",
  paid: "Paid",
  "insurance-pending": "Insurance Pending",
  cancelled: "Cancelled",
};

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  opd: "OPD",
  ipd: "Inpatient",
  emergency: "Emergency",
  pharmacy: "Pharmacy",
};

export const COVERAGE_LABELS: Record<CoverageScheme, string> = {
  nssf: "NSSF",
  hef: "Health Equity Fund",
  "private-insurance": "Private Insurance",
  corporate: "Corporate",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  "cash-usd": "Cash (USD)",
  "cash-khr": "Cash (KHR)",
  khqr: "KHQR",
  card: "Card",
  "bank-transfer": "Bank Transfer",
};
