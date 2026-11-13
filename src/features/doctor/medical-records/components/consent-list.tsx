"use client";

import { useState } from "react";
import { AlertTriangle, FileSignature, Loader2, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useServiceQuery } from "@/hooks/use-service-query";
import { patientService } from "@/features/front-desk/patients/service";
import { displayName, khmerFullName, latinFullName } from "@/features/front-desk/patients/patient-utils";
import { consentService } from "../consent-service";
import type { ConsentForm as ConsentRecord } from "../types";
import type { ConsentFormData } from "../validations";
import { ConsentForm, CONSENT_TYPE_LABELS } from "./consent-form";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { RECORDS_KM } from "@/features/doctor/medical-records/km";

const STATUS_VARIANT: Record<ConsentRecord["status"], "default" | "secondary" | "destructive" | "outline"> = {
  signed: "default",
  pending: "secondary",
  withdrawn: "destructive",
  expired: "outline",
};

interface ConsentListProps {
  /** When set, shows only this patient's consents and pre-selects them for new ones. */
  patient?: { patientId: string; name: string };
}

export function ConsentList({ patient }: ConsentListProps) {
  const t = useT(RECORDS_KM);
  const tAny = useTranslateAny(RECORDS_KM);
  const fmt = useDateFormat();
  const consents = useServiceQuery(`consents:${patient?.patientId ?? "all"}`, () => consentService.listConsents(patient?.patientId));
  // The patient picker in the form only needs the registry when no patient is pre-selected.
  const patients = useServiceQuery(`consent-patients:${patient ? "fixed" : "all"}`, () =>
    patient ? Promise.resolve([]) : patientService.listPatients()
  );
  const patientOptions = patient
    ? [{ id: patient.patientId, name: patient.name }]
    : (patients.data ?? []).map((p) => ({
        id: p.patientId,
        name: khmerFullName(p) ? `${khmerFullName(p)} · ${latinFullName(p)}` : latinFullName(p),
      }));

  const [creating, setCreating] = useState(false);
  const [withdrawing, setWithdrawing] = useState<ConsentRecord | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (data: ConsentFormData) => {
    const found = patients.data?.find((p) => p.patientId === data.patientId);
    const name = patient?.name ?? (found ? displayName(found) : data.patientId);
    await consentService.createConsent(data, name);
    await consents.reload();
    setCreating(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawing || !reason.trim()) return;
    setSaving(true);
    try {
      await consentService.withdrawConsent(withdrawing.id, reason.trim());
      await consents.reload();
      setWithdrawing(null);
      setReason("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>{t("Consent Forms")}</CardTitle>
            <CardDescription>
              {patient ? `Informed consent signed by or for ${patient.name}` : t("Informed consent for procedures, treatment and research")}
            </CardDescription>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("New Consent")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {consents.status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("Loading consent forms…")}
          </div>
        )}

        {consents.status === "error" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <p className="text-sm text-muted-foreground">{tAny(consents.error)}</p>
            <Button variant="outline" size="sm" onClick={consents.retry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("Try again")}
            </Button>
          </div>
        )}

        {consents.status === "success" && consents.data.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {patient ? t("No consent forms for this patient yet.") : t("No consent forms recorded yet.")}
          </p>
        )}

        {consents.status === "success" && consents.data.length > 0 && (
          <div className="space-y-4">
            {consents.data.map((consent) => (
              <div key={consent.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileSignature className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">{consent.procedureName}</h3>
                      <Badge variant="outline">{tAny(CONSENT_TYPE_LABELS[consent.consentType])}</Badge>
                      <Badge variant={STATUS_VARIANT[consent.status]} className="capitalize">
                        {tAny(consent.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
                      <div>
                        <div className="text-muted-foreground">{t("Form #")}</div>
                        <div className="font-medium">{consent.formNumber}</div>
                      </div>
                      {!patient && (
                        <div>
                          <div className="text-muted-foreground">{t("Patient")}</div>
                          <div className="font-medium" lang="km">
                            {consent.patientName}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-muted-foreground">{t("Consent by")}</div>
                        <div className="font-medium">
                          {consent.consentGivenBy === "patient" ? t("Patient") : `${consent.guardianName} (${consent.guardianRelation})`}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t("Explained by")}</div>
                        <div className="font-medium">{consent.explainedBy}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t("Signed")}</div>
                        <div className="font-medium">{fmt(consent.signedDate, "d MMM yyyy")}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("Risks: {risks} · Witness: {witness}", { risks: consent.risks.join(", "), witness: consent.witnessName })}
                    </p>
                    {consent.status === "withdrawn" && consent.withdrawnDate && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {t("Withdrawn {date}: {reason}", { date: fmt(consent.withdrawnDate, "d MMM yyyy"), reason: consent.withdrawnReason ?? "" })}
                      </p>
                    )}
                  </div>
                  {consent.status === "signed" && (
                    <Button size="sm" variant="outline" onClick={() => setWithdrawing(consent)}>
                      {t("Withdraw")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("New Consent Form")}</DialogTitle>
            <DialogDescription>
              {patient
                ? t("For {name} ({id}). Record informed consent before the procedure.", { name: patient.name, id: patient.patientId })
                : t("Record informed consent before the procedure.")}
            </DialogDescription>
          </DialogHeader>
          {creating && (
            <ConsentForm
              patients={patientOptions}
              initialData={patient ? { patientId: patient.patientId } : undefined}
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!withdrawing}
        onOpenChange={(open) => {
          if (!open) {
            setWithdrawing(null);
            setReason("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Withdraw Consent")}</DialogTitle>
            <DialogDescription>
              {t("{form} · {procedure}. The procedure must not go ahead on this consent.", {
                form: withdrawing?.formNumber ?? "",
                procedure: withdrawing?.procedureName ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="withdraw-reason">{t("Reason *")}</Label>
            <Textarea
              id="withdraw-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("e.g. Patient changed their mind after discussing with family")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawing(null)}>
              {t("Cancel")}
            </Button>
            <Button variant="destructive" disabled={!reason.trim() || saving} onClick={handleWithdraw}>
              {saving ? t("Withdrawing…") : t("Withdraw Consent")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
