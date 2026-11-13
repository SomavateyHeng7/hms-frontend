"use client";

import { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, ExternalLink, FileText, Loader2, Receipt, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePatientInvoices } from "../use-patient-invoices";
import {
  COVERAGE_LABELS,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  VISIT_TYPE_LABELS,
  formatKHR,
  formatUSD,
} from "../format";
import type { Invoice, InvoiceStatus } from "../types";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  unpaid: "bg-red-100 text-red-700 border-red-200",
  "partially-paid": "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  "insurance-pending": "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200 line-through",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );
}

function Money({ usd, rate, className }: { usd: number; rate: number; className?: string }) {
  return (
    <div className={cn("text-right", className)}>
      <div className="font-medium">{formatUSD(usd)}</div>
      <div className="text-xs text-muted-foreground">{formatKHR(usd, rate)}</div>
    </div>
  );
}

function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const rate = invoice.exchangeRate;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Issued</div>
          <div className="font-medium">{format(new Date(invoice.issuedAt), "PP p")}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Visit</div>
          <div className="font-medium">
            {VISIT_TYPE_LABELS[invoice.visitType]}
            {invoice.visitId ? ` · ${invoice.visitId}` : ""}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Department</div>
          <div className="font-medium">{invoice.department}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Exchange Rate</div>
          <div className="font-medium">៛{rate.toLocaleString("en-US")} / $1</div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2">Item</th>
              <th className="text-right font-medium px-3 py-2">Qty</th>
              <th className="text-right font-medium px-3 py-2">Unit Price</th>
              <th className="text-right font-medium px-3 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id} className="border-t">
                <td className="px-3 py-2">
                  <div>{line.description}</div>
                  <div className="text-xs text-muted-foreground capitalize">{line.category}</div>
                </td>
                <td className="px-3 py-2 text-right">{line.quantity}</td>
                <td className="px-3 py-2 text-right">{formatUSD(line.unitPrice)}</td>
                <td className="px-3 py-2 text-right">{formatUSD(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto max-w-sm space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatUSD(invoice.subtotal)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>−{formatUSD(invoice.discount)}</span>
          </div>
        )}
        {invoice.coverage && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {invoice.coverage.name}
              {invoice.coverage.memberId && <span className="block text-xs">{invoice.coverage.memberId}</span>}
            </span>
            <span>−{formatUSD(invoice.coverage.amount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Patient Payable</span>
          <Money usd={invoice.patientPayable} rate={rate} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Paid</span>
          <span>{formatUSD(invoice.amountPaid)}</span>
        </div>
        <div className={cn("flex justify-between font-semibold", invoice.balance > 0 && "text-red-600")}>
          <span>Balance Due</span>
          <Money usd={invoice.balance} rate={rate} />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Payments</h4>
        {invoice.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded.</p>
        ) : (
          <ul className="space-y-2">
            {invoice.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <div>
                  <div className="font-medium">
                    {PAYMENT_METHOD_LABELS[p.method]} · {p.receiptNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(p.paidAt), "PP p")} · {p.cashier}
                  </div>
                </div>
                <span className="font-medium">{formatUSD(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Read-only. Payments and changes are handled in the billing system.
        </p>
        {invoice.externalUrl ? (
          <Button variant="outline" size="sm" asChild>
            <a href={invoice.externalUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Billing
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled title="Available once the billing system is connected">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Billing
          </Button>
        )}
      </div>
    </div>
  );
}

export function PatientInvoices({ patientId }: { patientId: string }) {
  const result = usePatientInvoices(patientId);
  const [selected, setSelected] = useState<Invoice | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Invoices
        </CardTitle>
        <CardDescription>From the billing system · view only</CardDescription>
      </CardHeader>
      <CardContent>
        {result.status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading invoices…
          </div>
        )}

        {result.status === "error" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="font-medium">Invoices are unavailable</p>
              <p className="text-sm text-muted-foreground">{result.message} Patient care is not affected.</p>
            </div>
            <Button variant="outline" size="sm" onClick={result.retry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        )}

        {result.status === "success" && result.invoices.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8" />
            No invoices for this patient yet.
          </div>
        )}

        {result.status === "success" && result.invoices.length > 0 && (
          <InvoiceList invoices={result.invoices} onSelect={setSelected} />
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {selected.invoiceNumber}
                  <InvoiceStatusBadge status={selected.status} />
                </DialogTitle>
                <DialogDescription>{selected.patientName} · {selected.patientId}</DialogDescription>
              </DialogHeader>
              <InvoiceDetail invoice={selected} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function InvoiceList({ invoices, onSelect }: { invoices: Invoice[]; onSelect: (inv: Invoice) => void }) {
  const outstanding = invoices
    .filter((inv) => inv.status !== "cancelled" && inv.status !== "insurance-pending")
    .reduce((sum, inv) => sum + inv.balance, 0);
  const pendingInsurance = invoices.filter((inv) => inv.status === "insurance-pending").length;
  const rate = invoices[0].exchangeRate;

  return (
    <div className="space-y-4">
      {(outstanding > 0 || pendingInsurance > 0) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {outstanding > 0 && (
            <span>
              Outstanding balance: <strong>{formatUSD(outstanding)}</strong> ({formatKHR(outstanding, rate)})
            </span>
          )}
          {pendingInsurance > 0 && (
            <span>
              {pendingInsurance} invoice{pendingInsurance > 1 ? "s" : ""} awaiting insurance
            </span>
          )}
        </div>
      )}

      <ul className="divide-y rounded-md border">
        {invoices.map((inv) => (
          <li key={inv.id}>
            <button
              type="button"
              onClick={() => onSelect(inv)}
              className="flex w-full flex-col gap-2 px-4 py-3 text-left hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{inv.invoiceNumber}</span>
                  <InvoiceStatusBadge status={inv.status} />
                  {inv.coverage && (
                    <Badge variant="secondary">{COVERAGE_LABELS[inv.coverage.scheme]}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(inv.issuedAt), "PP")} · {VISIT_TYPE_LABELS[inv.visitType]} · {inv.department}
                </div>
              </div>
              <div className="flex gap-6 sm:text-right">
                <div>
                  <div className="text-xs text-muted-foreground">Payable</div>
                  <div className="font-medium">{formatUSD(inv.patientPayable)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Balance</div>
                  <div className={cn("font-medium", inv.balance > 0 && "text-red-600")}>
                    {formatUSD(inv.balance)}
                  </div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
