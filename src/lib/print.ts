import type { Patient } from "@/types/patient";
import type { Prescription, OPDBilling } from "@/types/opd";
import type { LabReport } from "@/types/laboratory";

/** Escape text for safe interpolation into an HTML string. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const fmtDate = (d: Date | string | undefined) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtDateTime = (d: Date | string | undefined) =>
  d
    ? new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "—";
const money = (n: number) => `$${n.toFixed(2)}`;

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 32px; font-size: 13px; line-height: 1.45; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 16px; }
  header h1 { font-size: 20px; margin: 0; }
  header .meta { text-align: right; font-size: 12px; color: #444; }
  h2 { font-size: 14px; margin: 18px 0 6px; text-transform: uppercase; letter-spacing: .04em; color: #333; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; font-size: 12px; }
  td.num, th.num { text-align: right; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
  .label { color: #555; }
  .alert { border: 1px solid #b91c1c; background: #fef2f2; color: #7f1d1d; padding: 6px 10px; border-radius: 4px; margin-top: 8px; }
  .critical { color: #b91c1c; font-weight: 600; }
  .sig { margin-top: 48px; width: 260px; border-top: 1px solid #111; padding-top: 4px; font-size: 12px; }
  .totals { width: 280px; margin-left: auto; margin-top: 10px; }
  .totals td { border: none; padding: 3px 0; }
  .totals tr.grand td { border-top: 2px solid #111; font-weight: 700; font-size: 14px; }
  footer { margin-top: 28px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 8px; }
  @media print { body { margin: 12mm; } }
`;

export interface PrintOptions {
  /** Name of the signed-in user, shown in the footer for traceability */
  printedBy?: string;
}

function documentShell(title: string, subtitle: string, rightMeta: string, body: string, options?: PrintOptions): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${STYLES}</style></head><body>
<header><div><h1>Hospital Management System</h1><div>${escapeHtml(subtitle)}</div></div><div class="meta">${rightMeta}</div></header>
${body}
<footer>Generated ${escapeHtml(fmtDateTime(new Date()))}${options?.printedBy ? ` by ${escapeHtml(options.printedBy)}` : ""}. This document is a demo output and is not a valid medical record.</footer>
</body></html>`;
}

function patientBlock(patient: Pick<Patient, "firstName" | "lastName" | "patientId" | "dateOfBirth" | "gender" | "bloodType">): string {
  return `<div class="grid">
    <div><span class="label">Patient:</span> <strong>${escapeHtml(patient.firstName)} ${escapeHtml(patient.lastName)}</strong></div>
    <div><span class="label">Patient ID:</span> ${escapeHtml(patient.patientId)}</div>
    <div><span class="label">DOB:</span> ${escapeHtml(fmtDate(patient.dateOfBirth))}</div>
    <div><span class="label">Gender:</span> ${escapeHtml(patient.gender)}</div>
    ${patient.bloodType ? `<div><span class="label">Blood type:</span> ${escapeHtml(patient.bloodType)}</div>` : ""}
  </div>`;
}

export function prescriptionHtml(rx: Prescription, patient: Patient, options?: PrintOptions): string {
  const rows = rx.medications
    .map(
      (m) => `<tr>
        <td><strong>${escapeHtml(m.name)}</strong>${m.genericName ? `<br><span class="label">${escapeHtml(m.genericName)}</span>` : ""}</td>
        <td>${escapeHtml(m.dosage)}</td>
        <td>${escapeHtml(m.frequency)}</td>
        <td>${escapeHtml(m.duration)}</td>
        <td class="num">${escapeHtml(m.quantity)}</td>
        <td>${escapeHtml(m.route)}${m.instructions ? `<br><span class="label">${escapeHtml(m.instructions)}</span>` : ""}</td>
      </tr>`
    )
    .join("");
  const body = `
    ${patientBlock(patient)}
    ${patient.allergies ? `<div class="alert"><strong>Allergies:</strong> ${escapeHtml(patient.allergies)}</div>` : ""}
    <h2>Medications</h2>
    <table><thead><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th class="num">Qty</th><th>Route / instructions</th></tr></thead><tbody>${rows}</tbody></table>
    ${rx.notes ? `<h2>Notes</h2><p>${escapeHtml(rx.notes)}</p>` : ""}
    ${rx.pharmacyNotes ? `<div class="alert"><strong>Pharmacy note:</strong> ${escapeHtml(rx.pharmacyNotes)}</div>` : ""}
    <div class="sig">${escapeHtml(rx.doctorName)}<br>License ${escapeHtml(rx.licenseNumber)}</div>`;
  return documentShell(
    `Prescription ${rx.prescriptionNumber}`,
    "Prescription",
    `<div><strong>${escapeHtml(rx.prescriptionNumber)}</strong></div><div>Issued ${escapeHtml(fmtDate(rx.issuedDate))}</div><div>Valid until ${escapeHtml(fmtDate(rx.validUntil))}</div>`,
    body,
    options
  );
}

export function labReportHtml(report: LabReport, options?: PrintOptions): string {
  const sections = report.tests
    .map((t) => {
      const rows =
        t.results.length === 0
          ? `<tr><td colspan="5" class="label">No results entered yet</td></tr>`
          : t.results
              .map((r) => {
                const critical = r.flag === "critical_high" || r.flag === "critical_low" || r.isCritical;
                return `<tr>
                  <td>${escapeHtml(r.componentName || r.testCode)}</td>
                  <td class="${critical ? "critical" : ""}">${escapeHtml(r.value)} ${escapeHtml(r.unit)}</td>
                  <td>${escapeHtml(r.referenceRange || r.normalRange || "—")}</td>
                  <td class="${critical ? "critical" : ""}">${escapeHtml(String(r.flag).replace("_", " "))}</td>
                  <td>${escapeHtml(r.status)}</td>
                </tr>`;
              })
              .join("");
      return `<h2>${escapeHtml(t.testName)} (${escapeHtml(t.testCode)})</h2>
        <table><thead><tr><th>Component</th><th>Result</th><th>Reference</th><th>Flag</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`;
    })
    .join("");
  const body = `
    <div class="grid">
      <div><span class="label">Patient:</span> <strong>${escapeHtml(report.patientName)}</strong></div>
      <div><span class="label">MRN:</span> ${escapeHtml(report.patientMRN)}</div>
      <div><span class="label">DOB:</span> ${escapeHtml(fmtDate(report.patientDOB))}</div>
      <div><span class="label">Gender:</span> ${escapeHtml(report.patientGender)}</div>
      <div><span class="label">Ordering physician:</span> ${escapeHtml(report.orderingPhysician.name)}</div>
      <div><span class="label">Clinical indication:</span> ${escapeHtml(report.clinicalIndication)}</div>
    </div>
    ${report.criticalValues ? `<div class="alert"><strong>This report contains critical values.</strong></div>` : ""}
    ${sections}
    ${report.comments ? `<h2>Comments</h2><p>${escapeHtml(report.comments)}</p>` : ""}
    <div class="sig">${escapeHtml(report.technologist.name)}<br>${escapeHtml(report.status)} report</div>`;
  return documentShell(
    `Lab report ${report.reportNumber}`,
    "Laboratory Report",
    `<div><strong>${escapeHtml(report.reportNumber)}</strong></div><div>${escapeHtml(fmtDateTime(report.reportDate))}</div>`,
    body,
    options
  );
}

export function billHtml(bill: OPDBilling, patient: Patient, options?: PrintOptions): string {
  const rows = bill.items
    .map((i) => {
      const gross = i.quantity * i.unitPrice;
      const net = gross - gross * (i.discount / 100);
      return `<tr>
        <td>${escapeHtml(i.description)}${i.serviceCode ? `<br><span class="label">${escapeHtml(i.serviceCode)}</span>` : ""}</td>
        <td class="num">${escapeHtml(i.quantity)}</td>
        <td class="num">${money(i.unitPrice)}</td>
        <td class="num">${escapeHtml(i.discount)}%</td>
        <td class="num">${money(net)}</td>
      </tr>`;
    })
    .join("");
  const body = `
    ${patientBlock(patient)}
    <h2>Charges</h2>
    <table><thead><tr><th>Service</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Disc.</th><th class="num">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <table class="totals">
      <tr><td>Subtotal</td><td class="num">${money(bill.subtotal)}</td></tr>
      ${bill.discountAmount > 0 ? `<tr><td>Discount (${escapeHtml(bill.discount)}%)</td><td class="num">-${money(bill.discountAmount)}</td></tr>` : ""}
      <tr><td>Tax (${escapeHtml(bill.taxRate)}%)</td><td class="num">${money(bill.taxAmount)}</td></tr>
      <tr class="grand"><td>Total</td><td class="num">${money(bill.totalAmount)}</td></tr>
      <tr><td>Paid</td><td class="num">${money(bill.paidAmount)}</td></tr>
      <tr><td>Balance due</td><td class="num">${money(bill.balanceAmount)}</td></tr>
    </table>
    ${bill.notes ? `<h2>Notes</h2><p>${escapeHtml(bill.notes)}</p>` : ""}`;
  return documentShell(
    `Bill ${bill.billNumber}`,
    "Invoice",
    `<div><strong>${escapeHtml(bill.billNumber)}</strong></div><div>Date ${escapeHtml(fmtDate(bill.billDate))}</div><div>Due ${escapeHtml(fmtDate(bill.dueDate))}</div><div>Status: ${escapeHtml(bill.paymentStatus)}</div>`,
    body,
    options
  );
}

/**
 * Print an HTML document through a hidden iframe (no popup, so popup blockers don't interfere).
 * Browsers offer "Save as PDF" in the print dialog.
 */
export function printDocument(html: string): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("data-print-frame", "");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  iframe.srcdoc = html;
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    // Leave the frame long enough for the print dialog to read it
    setTimeout(() => iframe.remove(), 60_000);
  };
  document.body.appendChild(iframe);
}
