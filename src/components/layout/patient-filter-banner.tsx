"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ShieldCheck, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClinicalData } from "@/lib/clinical-store";
import { parseAllergies } from "@/lib/clinical-safety";
import type { Patient } from "@/types/patient";

/** Reads `?patient=<id>` and returns the matching patient (or undefined). */
export function useSelectedPatient() {
  const searchParams = useSearchParams();
  const { getPatient } = useClinicalData();
  const id = searchParams.get("patient");
  return id ? getPatient(id) : undefined;
}

function age(dob: Date) {
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) years--;
  return years;
}

interface PatientFilterBannerProps {
  /** Show this patient even when `?patient=` is absent (e.g. a module that always needs one). */
  patient?: Patient;
  /** Let the user switch the active patient from the banner. */
  selectable?: boolean;
  /** Show clinical details (blood type, allergies, medications). Off for roles without clinical access. */
  clinical?: boolean;
}

/**
 * Banner shown on module pages when a patient is in context: name, age, blood type
 * and — prominently — allergies, so they're visible while ordering or prescribing.
 */
export function PatientFilterBanner({ patient: patientOverride, selectable, clinical = true }: PatientFilterBannerProps = {}) {
  const fromParam = useSelectedPatient();
  const patient = fromParam ?? patientOverride;
  const { patients } = useClinicalData();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  if (!patient) return null;

  const withPatient = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("patient", id);
    else params.delete("patient");
    return params.size ? `${pathname}?${params}` : pathname;
  };

  const allergies = parseAllergies(patient.allergies);

  return (
    <div className="mb-4 space-y-2 rounded-md border bg-accent/40 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>
          <strong>
            {patient.firstName} {patient.lastName}
          </strong>{" "}
          ({patient.patientId}) · {age(patient.dateOfBirth)}y · {patient.gender}
        </span>
        {clinical && patient.bloodType && <Badge variant="outline">Blood type {patient.bloodType}</Badge>}
        {clinical && (allergies.length > 0 ? (
          <Badge variant="destructive" className="gap-1 capitalize">
            <AlertTriangle className="h-3 w-3" />
            Allergies: {allergies.join(", ")}
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            No known allergies
          </Badge>
        ))}
        <Link href={`/patients/${patient.id}`} className="underline underline-offset-2">
          {clinical ? "Open timeline" : "Open patient"}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {selectable && (
            <Select value={patient.id} onValueChange={(id) => router.replace(withPatient(id))}>
              <SelectTrigger className="h-8 w-52" aria-label="Switch patient">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.patientId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {fromParam && !selectable && (
            <Button variant="ghost" size="sm" asChild className="h-7">
              <Link href={withPatient(null)}>
                <X className="mr-1 h-3 w-3" />
                Clear
              </Link>
            </Button>
          )}
        </div>
      </div>
      {clinical && patient.currentMedications && patient.currentMedications.toLowerCase() !== "none" && (
        <p className="text-muted-foreground">Current medications: {patient.currentMedications}</p>
      )}
    </div>
  );
}
