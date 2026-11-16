"use client";

import { AlertOctagon, AlertTriangle, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { requiresAcknowledgement, type SafetyWarning, type WarningSeverity } from "@/lib/clinical-safety";

const SEVERITY_STYLE: Record<WarningSeverity, { label: string; box: string; icon: React.ElementType }> = {
  contraindicated: { label: "Contraindicated", box: "border-red-300 bg-red-50 text-red-900", icon: AlertOctagon },
  major: { label: "Major", box: "border-red-200 bg-red-50 text-red-900", icon: AlertOctagon },
  moderate: { label: "Moderate", box: "border-amber-300 bg-amber-50 text-amber-900", icon: AlertTriangle },
};

interface SafetyWarningsProps {
  warnings: SafetyWarning[];
  acknowledged: boolean;
  onAcknowledgedChange: (value: boolean) => void;
}

/** Lists prescription safety warnings and, for serious ones, asks for explicit acknowledgement. */
export function SafetyWarnings({ warnings, acknowledged, onAcknowledgedChange }: SafetyWarningsProps) {
  if (warnings.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        No allergy or interaction warnings found
      </p>
    );
  }

  const needsAck = requiresAcknowledgement(warnings);

  return (
    <div className="space-y-3" role="alert" aria-live="polite">
      <ul className="space-y-2">
        {warnings.map((w) => {
          const { label, box, icon: Icon } = SEVERITY_STYLE[w.severity];
          return (
            <li key={w.id} className={`flex gap-3 rounded-md border p-3 text-sm ${box}`}>
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="font-medium">
                  {w.kind === "allergy" ? "Allergy" : "Interaction"} · {label}
                </p>
                <p>{w.message}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {needsAck && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 p-3">
          <Checkbox
            id="safety-ack"
            checked={acknowledged}
            onCheckedChange={(checked) => onAcknowledgedChange(checked === true)}
          />
          <Label htmlFor="safety-ack" className="text-sm leading-snug">
            I have reviewed these warnings and want to prescribe anyway. The override will be recorded on the prescription.
          </Label>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Checks use a small built-in rule set and do not replace a full drug database or clinical judgement.
      </p>
    </div>
  );
}
