"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Download, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccess } from "@/lib/access";
import { auditToCsv, filterAudit, type AuditAction } from "@/lib/audit";
import { ROLE_LABELS } from "@/lib/permissions";

const ACTION_LABELS: Record<AuditAction, string> = {
  "auth.login": "Sign in",
  "auth.logout": "Sign out",
  "access.denied": "Access denied",
  "patient.view": "Patient viewed",
  "patient.register": "Patient registered",
  "patient.update": "Patient updated",
  "prescription.create": "Prescription created",
  "prescription.safety_override": "Safety override",
  "lab_order.create": "Lab order created",
  "lab_order.cancel": "Lab order cancelled",
  "lab_result.enter": "Result entered",
  "lab_result.validate": "Result validated",
  "lab_report.create": "Lab report created",
  "critical_value.acknowledge": "Critical value acknowledged",
  "imaging_order.create": "Imaging order created",
  "bill.create": "Bill created",
  "bill.payment": "Payment recorded",
  "document.print": "Document printed",
  "audit.view": "Audit log viewed",
  "audit.export": "Audit log exported",
};

/** Entries that deserve a second look get a stronger badge. */
function badgeVariant(action: AuditAction): "destructive" | "default" | "secondary" | "outline" {
  if (action === "access.denied") return "destructive";
  if (action === "prescription.safety_override" || action === "critical_value.acknowledge") return "default";
  if (action.startsWith("auth.") || action.startsWith("audit.")) return "outline";
  return "secondary";
}

export function AuditLogView() {
  const { auditLog, log, ready } = useAccess();
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("all");
  const [action, setAction] = useState<AuditAction | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Viewing the audit log is itself recorded
  useEffect(() => {
    if (ready) log({ action: "audit.view", summary: "Opened the audit log" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const users = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of auditLog) if (!seen.has(e.userId)) seen.set(e.userId, e.userName);
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [auditLog]);

  const filtered = useMemo(
    () => filterAudit(auditLog, { query, userId, action, from, to }),
    [auditLog, query, userId, action, from, to]
  );

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportCsv = () => {
    const blob = new Blob([auditToCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    log({ action: "audit.export", summary: `Exported ${filtered.length} audit entr${filtered.length === 1 ? "y" : "ies"} to CSV` });
    toast.success(`Exported ${filtered.length} entries`);
  };

  const hasFilters = query || userId !== "all" || action !== "all" || from || to;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            Who did what, and when. Stored in this browser only (newest 2,000 entries) — a production system needs a
            tamper-evident server-side log.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Showing {filtered.length} of {auditLog.length} entries
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="audit-search">Search</Label>
            <Input
              id="audit-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Patient, order number, summary…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>User</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger aria-label="Filter by user">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Action</Label>
            <Select value={action} onValueChange={(v) => setAction(v as AuditAction | "all")}>
              <SelectTrigger aria-label="Filter by action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {ACTION_LABELS[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:col-span-2">
            <div className="space-y-1.5">
              <Label htmlFor="audit-from">From</Label>
              <Input id="audit-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-to">To</Label>
              <Input id="audit-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          {hasFilters && (
            <div className="sm:col-span-2 lg:col-span-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setUserId("all");
                  setAction("all");
                  setFrom("");
                  setTo("");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title={auditLog.length === 0 ? "No activity recorded yet" : "No entries match these filters"}
              description={
                auditLog.length === 0
                  ? "Actions such as signing in, ordering and printing are recorded here."
                  : "Try widening the date range or clearing a filter."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const hasDetails = !!e.details?.length;
                  const open = expanded.has(e.id);
                  return (
                    <Fragment key={e.id}>
                      <TableRow>
                        <TableCell className="w-8 pr-0">
                          {hasDetails && (
                            <button
                              type="button"
                              onClick={() => toggle(e.id)}
                              aria-expanded={open}
                              aria-label={open ? "Hide details" : "Show details"}
                              className="rounded p-1 hover:bg-accent"
                            >
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(e.timestamp), "MMM d, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium">{e.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {e.role === "anonymous" ? "Not signed in" : ROLE_LABELS[e.role]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant(e.action)} className="whitespace-nowrap">
                            {ACTION_LABELS[e.action] ?? e.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{e.patientName ?? "—"}</TableCell>
                        <TableCell className="text-sm">{e.summary}</TableCell>
                      </TableRow>
                      {hasDetails && open && (
                        <TableRow>
                          <TableCell />
                          <TableCell colSpan={5} className="bg-muted/40 text-sm">
                            <ul className="list-disc space-y-1 pl-5">
                              {e.details!.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
