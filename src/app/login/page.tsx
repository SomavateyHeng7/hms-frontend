"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeartPulse, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { safeNextPath } from "@/components/layout/app-shell";
import { useAccess } from "@/lib/access";
import { DEMO_USERS, ROLE_LABELS } from "@/lib/permissions";

const ROLE_BLURB: Record<string, string> = {
  doctor: "Prescribes, orders labs and imaging, acknowledges critical values",
  nurse: "Registers patients, books appointments, acknowledges critical values",
  lab_technician: "Enters and validates results, builds lab reports",
  radiologist: "Imaging studies and reports",
  receptionist: "Registration and appointments — no clinical data",
  billing: "Bills and payments — no clinical data",
  admin: "Reports and the audit log — no clinical actions",
};

function LoginForm() {
  const { login } = useAccess();
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <HeartPulse className="h-8 w-8 text-red-500" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold">Hospital Management System</h1>
          <p className="text-sm text-muted-foreground">Choose a demo account to sign in</p>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          <strong>Demo sign-in only.</strong> There are no passwords. Roles and the audit log run in this browser and are
          not real security — production needs server-side authentication and authorization.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_USERS.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => {
              if (login(u.id)) router.replace(next);
            }}
            className="text-left"
            aria-label={`Sign in as ${u.name}, ${ROLE_LABELS[u.role]}`}
          >
            <Card className="h-full transition-colors hover:border-primary hover:bg-accent/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  {u.name}
                  <Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge>
                </CardTitle>
                <CardDescription>{u.department}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{ROLE_BLURB[u.role]}</CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
