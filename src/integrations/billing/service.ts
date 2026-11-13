import type { Invoice } from "./types";
import { MOCK_INVOICES } from "./mock-data";

/**
 * The only way the HMS talks to billing. Components depend on this interface, never on
 * the mock, so connecting the real billing system means adding an HTTP implementation
 * and changing the `billingService` export below.
 */
export interface BillingService {
  getPatientInvoices(patientId: string): Promise<Invoice[]>;
  getInvoice(invoiceId: string): Promise<Invoice | null>;
}

export class BillingUnavailableError extends Error {
  constructor() {
    super("The billing system is not reachable right now.");
    this.name = "BillingUnavailableError";
  }
}

/**
 * Demo controls via the URL, so end users can see every state during a walkthrough:
 *   ?billing=offline  -> billing system unreachable
 *   ?billing=empty    -> patient has no invoices
 */
function demoMode(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("billing");
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockBillingService: BillingService = {
  async getPatientInvoices(patientId) {
    await delay(500);
    const mode = demoMode();
    if (mode === "offline") throw new BillingUnavailableError();
    if (mode === "empty") return [];
    return MOCK_INVOICES.filter((inv) => inv.patientId === patientId).sort((a, b) =>
      b.issuedAt.localeCompare(a.issuedAt)
    );
  },
  async getInvoice(invoiceId) {
    await delay(300);
    if (demoMode() === "offline") throw new BillingUnavailableError();
    return MOCK_INVOICES.find((inv) => inv.id === invoiceId) ?? null;
  },
};

export const billingService: BillingService = mockBillingService;
