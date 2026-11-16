import type { Role } from "@/lib/permissions";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "access.denied"
  | "patient.view"
  | "patient.register"
  | "patient.update"
  | "prescription.create"
  | "prescription.safety_override"
  | "lab_order.create"
  | "lab_order.cancel"
  | "lab_result.enter"
  | "lab_result.validate"
  | "lab_report.create"
  | "critical_value.acknowledge"
  | "imaging_order.create"
  | "bill.create"
  | "bill.payment"
  | "document.print"
  | "audit.view"
  | "audit.export";

export interface AuditEntry {
  id: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  userId: string;
  userName: string;
  role: Role | "anonymous";
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  patientId?: string;
  patientName?: string;
  summary: string;
  /** Extra detail lines, e.g. the safety warnings that were overridden */
  details?: string[];
}

export type AuditEntryInput = Omit<AuditEntry, "id" | "timestamp" | "userId" | "userName" | "role">;

export interface AuditFilters {
  query?: string;
  userId?: string;
  action?: AuditAction | "all";
  /** Inclusive, ISO date (yyyy-mm-dd) */
  from?: string;
  /** Inclusive, ISO date (yyyy-mm-dd) */
  to?: string;
}

export function filterAudit(entries: AuditEntry[], filters: AuditFilters): AuditEntry[] {
  const q = filters.query?.trim().toLowerCase();
  const from = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : undefined;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999`).getTime() : undefined;
  return entries.filter((e) => {
    if (filters.userId && filters.userId !== "all" && e.userId !== filters.userId) return false;
    if (filters.action && filters.action !== "all" && e.action !== filters.action) return false;
    const t = new Date(e.timestamp).getTime();
    if (from !== undefined && t < from) return false;
    if (to !== undefined && t > to) return false;
    if (q) {
      const haystack = [e.summary, e.userName, e.patientName, e.entityId, e.action, ...(e.details ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/**
 * CSV cell with RFC 4180 quoting. Cells that start with a formula character are
 * prefixed with an apostrophe so spreadsheets don't execute them (CSV injection).
 */
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function auditToCsv(entries: AuditEntry[]): string {
  const header = ["Timestamp", "User", "Role", "Action", "Patient", "Entity", "Summary", "Details"];
  const rows = entries.map((e) =>
    [
      e.timestamp,
      e.userName,
      e.role,
      e.action,
      e.patientName ?? "",
      [e.entityType, e.entityId].filter(Boolean).join(":"),
      e.summary,
      (e.details ?? []).join(" | "),
    ]
      .map(csvCell)
      .join(",")
  );
  return [header.join(","), ...rows].join("\r\n");
}

/** Keep the newest entries when the log grows past `max`. Entries are stored newest-first. */
export const capAudit = (entries: AuditEntry[], max = 2000) => (entries.length > max ? entries.slice(0, max) : entries);
