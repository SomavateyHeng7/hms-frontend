"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Database,
  FileSignature,
  Languages,
  Layers,
  Loader2,
  Plug,
  RefreshCw,
  RotateCcw,
  Settings,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceQuery } from "@/hooks/use-service-query";
import { useTabParam } from "@/hooks/use-tab-param";
import { cn } from "@/lib/utils";
import { resetAllDemoData } from "@/lib/mock/store";
import { patientService } from "@/features/front-desk/patients/service";
import { displayName } from "@/features/front-desk/patients/patient-utils";
import { consentService } from "@/features/doctor/medical-records/consent-service";
import { billingService } from "@/integrations/billing/service";
import { AREA_LABELS, EXTERNAL_SYSTEMS, MODULES, type ModuleArea, type SystemModule } from "../module-registry";
import { saveSystemSettings, setModuleEnabled, useSystemSettings, type SystemSettings } from "../system-settings";
import { useT, useTranslateAny } from "@/lib/i18n/messages";
import { ADMIN_SYSTEM_KM } from "@/features/admin/system/km";

const TABS = ["overview", "modules", "integrations", "settings"] as const;
const AREAS = Object.keys(AREA_LABELS) as ModuleArea[];

/** Live figures from the modules that run on the shared data layer. */
async function loadSnapshot() {
  const [patients, appointments, visits, consents] = await Promise.all([
    patientService.listPatients(),
    patientService.listAppointments(),
    patientService.listVisits(),
    consentService.listConsents(),
  ]);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return {
    activePatients: patients.filter((p) => p.status === "active").length,
    totalPatients: patients.length,
    latestPatients: [...patients].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)).slice(0, 5),
    upcomingAppointments: appointments.filter(
      (a) => new Date(a.appointmentDate) >= startOfToday && (a.status === "scheduled" || a.status === "confirmed")
    ).length,
    visits: visits.length,
    signedConsents: consents.filter((c) => c.status === "signed").length,
    pendingConsents: consents.filter((c) => c.status === "pending").length,
  };
}

export function AdminConsole() {
  const t = useT(ADMIN_SYSTEM_KM);
  const [tab, setTab] = useTabParam("overview", TABS);
  const settings = useSystemSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{t("System administration")}</p>
          <h1 className="text-3xl font-bold tracking-tight">{t("Admin Console")}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("Oversee every module, connected system and hospital setting in one place.")}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <Building2 className="h-5 w-5 text-primary" />
          <div className="leading-tight">
            <p className="font-medium">{settings.hospitalName}</p>
            <p className="text-sm text-muted-foreground">
              {settings.hospitalType === "public" ? t("Public hospital") : t("Private hospital")}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start sm:w-auto">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="modules">{t("Modules")}</TabsTrigger>
          <TabsTrigger value="integrations">{t("Connected systems")}</TabsTrigger>
          <TabsTrigger value="settings">{t("Hospital settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Overview settings={settings} onOpenTab={setTab} />
        </TabsContent>
        <TabsContent value="modules" className="mt-6">
          <ModulesPanel settings={settings} />
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <IntegrationsPanel />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <SettingsPanel settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ Overview */

function Overview({ settings, onOpenTab }: { settings: SystemSettings; onOpenTab: (tab: string) => void }) {
  const t = useT(ADMIN_SYSTEM_KM);
  const tAny = useTranslateAny(ADMIN_SYSTEM_KM);
  const snapshot = useServiceQuery("admin-snapshot", loadSnapshot);
  const disabled = new Set(settings.disabledModules);
  const enabledCount = MODULES.length - disabled.size;
  const prototypeCount = MODULES.filter((m) => m.maturity === "prototype" && !disabled.has(m.id)).length;
  const data = snapshot.status === "success" ? snapshot.data : null;

  const attention = [
    {
      icon: Layers,
      tone: "amber" as const,
      title: t("{count} modules use fixed sample data", { count: prototypeCount }),
      detail: t("Their screens can be reviewed, but changes are not saved yet."),
      action: () => onOpenTab("modules"),
      actionLabel: t("View modules"),
    },
    {
      icon: Plug,
      tone: "amber" as const,
      title: t("Billing shows sample invoices"),
      detail: t("The real billing system is not connected. Pharmacy and inventory are not connected."),
      action: () => onOpenTab("integrations"),
      actionLabel: t("View connected systems"),
    },
    {
      icon: Languages,
      tone: "blue" as const,
      title: t("Khmer wording needs review"),
      detail: t("All screens are translated; a Khmer-speaking clinician should check the wording before the pilot."),
    },
    ...(disabled.size > 0
      ? [
          {
            icon: CircleDashed,
            tone: "slate" as const,
            title: disabled.size > 1 ? t("{count} modules are switched off", { count: disabled.size }) : t("1 module is switched off"),
            detail: t("Switched-off modules are hidden from the sidebar."),
            action: () => onOpenTab("modules"),
            actionLabel: t("Manage"),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label={t("Registered patients")} value={data?.totalPatients} note={data ? t("{count} active", { count: data.activePatients }) : undefined} href="/front-desk/patients?view=list" />
        <StatCard icon={CalendarClock} label={t("Upcoming appointments")} value={data?.upcomingAppointments} note={data ? t("{count} visits recorded", { count: data.visits }) : undefined} href="/front-desk/patients" />
        <StatCard icon={FileSignature} label={t("Signed consents")} value={data?.signedConsents} note={data ? t("{count} awaiting signature", { count: data.pendingConsents }) : undefined} href="/doctor/medical-records?tab=consents" />
        <StatCard icon={Layers} label={t("Modules switched on")} value={enabledCount} note={t("of {count} modules", { count: MODULES.length })} onClick={() => onOpenTab("modules")} />
      </div>
      {snapshot.status === "error" && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t("Live figures are unavailable: {error}", { error: tAny(snapshot.error) })}
          </span>
          <Button size="sm" variant="outline" onClick={() => snapshot.retry()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("Try again")}
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("Modules by area")}</CardTitle>
            <CardDescription>{t("Status of every part of the system. Select a module to open it.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {AREAS.map((area) => (
                <div key={area} className="rounded-lg border p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tAny(AREA_LABELS[area])}</p>
                  <ul className="space-y-1">
                    {MODULES.filter((m) => m.area === area).map((m) => {
                      const off = disabled.has(m.id);
                      return (
                        <li key={m.id}>
                          <Link
                            href={m.href}
                            className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent", off && "text-muted-foreground")}
                          >
                            <StatusDot module={m} off={off} />
                            <span className="flex-1">{tAny(m.name)}</span>
                            <span className="text-xs text-muted-foreground">{off ? t("Off") : m.maturity === "connected" ? t("Live data") : t("Sample data")}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />{t("Live data: changes are saved")}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />{t("Sample data: screens only")}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />{t("Switched off")}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Needs attention")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attention.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-lg border p-3">
                  <item.icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      item.tone === "amber" && "text-amber-600",
                      item.tone === "blue" && "text-primary",
                      item.tone === "slate" && "text-muted-foreground"
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                    {"action" in item && item.action && (
                      <button type="button" onClick={item.action} className="text-sm font-medium text-primary hover:underline">
                        {item.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Latest registrations")}</CardTitle>
            </CardHeader>
            <CardContent>
              {snapshot.status === "loading" && <Loading />}
              {data && data.latestPatients.length === 0 && <p className="text-sm text-muted-foreground">{t("No patients registered yet.")}</p>}
              {data && data.latestPatients.length > 0 && (
                <ul className="divide-y">
                  {data.latestPatients.map((p) => (
                    <li key={p.id}>
                      <Link href={`/front-desk/patients?view=details&patient=${p.id}`} className="flex items-center justify-between gap-2 py-2 text-sm hover:text-primary">
                        <span className="truncate">{displayName(p)}</span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">{p.patientId}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  href,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: number;
  note?: string;
  href?: string;
  onClick?: () => void;
}) {
  const body = (
    <CardContent className="flex items-start justify-between gap-3 p-5">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{value ?? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}</p>
        {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
      </div>
      <span className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-5 w-5" />
      </span>
    </CardContent>
  );
  const cardClass = "h-full transition-colors hover:border-primary/50";
  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={cardClass}>{body}</Card>
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <Card className={cardClass}>{body}</Card>
    </button>
  );
}

function StatusDot({ module, off }: { module: SystemModule; off: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("h-2 w-2 shrink-0 rounded-full", off ? "bg-slate-300" : module.maturity === "connected" ? "bg-emerald-500" : "bg-amber-500")}
    />
  );
}

function Loading() {
  const t = useT(ADMIN_SYSTEM_KM);
  return (
    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {t("Loading…")}
    </div>
  );
}

/* ------------------------------------------------------------------ Modules */

function ModulesPanel({ settings }: { settings: SystemSettings }) {
  const t = useT(ADMIN_SYSTEM_KM);
  const tAny = useTranslateAny(ADMIN_SYSTEM_KM);
  const disabled = new Set(settings.disabledModules);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted-foreground">
        {t("Switch off the modules this hospital does not use. They disappear from the sidebar but keep their data. Patients and Medical Records are core modules and always stay on. In the prototype this setting is saved in this browser only.")}
      </p>
      {AREAS.map((area) => (
        <Card key={area}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{tAny(AREA_LABELS[area])}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {MODULES.filter((m) => m.area === area).map((m) => {
              const on = !disabled.has(m.id);
              const switchId = `module-${m.id}`;
              return (
                <div key={m.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label htmlFor={switchId} className="text-sm font-medium">
                        {tAny(m.name)}
                      </Label>
                      {m.core && <Badge variant="outline">{t("Core")}</Badge>}
                      <MaturityBadge module={m} />
                    </div>
                    <p className="text-sm text-muted-foreground">{tAny(m.description)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm" className={cn(!on && "invisible")}>
                      <Link href={m.href}>
                        {t("Open")}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <span className="w-8 text-right text-sm text-muted-foreground">{on ? t("On") : t("Off")}</span>
                    <Switch id={switchId} checked={on} disabled={m.core} onCheckedChange={(checked) => setModuleEnabled(m.id, checked)} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MaturityBadge({ module }: { module: SystemModule }) {
  const t = useT(ADMIN_SYSTEM_KM);
  return module.maturity === "connected" ? (
    <Badge className="border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{t("Live data")}</Badge>
  ) : (
    <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">{t("Sample data")}</Badge>
  );
}

/* ------------------------------------------------------------------ Connected systems */

type ProbeResult = { status: "idle" } | { status: "checking" } | { status: "ok"; ms: number; count: number } | { status: "failed"; message: string };

function IntegrationsPanel() {
  const t = useT(ADMIN_SYSTEM_KM);
  const tAny = useTranslateAny(ADMIN_SYSTEM_KM);
  const [probe, setProbe] = useState<ProbeResult>({ status: "idle" });

  const testBilling = async () => {
    setProbe({ status: "checking" });
    const started = performance.now();
    try {
      const invoices = await billingService.getPatientInvoices("PT-000001");
      setProbe({ status: "ok", ms: Math.round(performance.now() - started), count: invoices.length });
    } catch (err) {
      setProbe({ status: "failed", message: err instanceof Error ? tAny(err.message) : t("No response") });
    }
  };

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm text-muted-foreground">
        {t("Billing, pharmacy and inventory are separate systems. The HMS only reads invoices from billing and prints prescriptions; it does not send anything to these systems yet.")}
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {EXTERNAL_SYSTEMS.map((system) => (
          <Card key={system.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plug className="h-4 w-4 text-primary" />
                  {tAny(system.name)}
                </CardTitle>
                {system.status === "sample-data" ? (
                  <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">{t("Sample data")}</Badge>
                ) : (
                  <Badge variant="outline">{t("Not connected")}</Badge>
                )}
              </div>
              <CardDescription>{tAny(system.role)}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <dl className="text-sm">
                <dt className="text-muted-foreground">{t("Data flow")}</dt>
                <dd className="font-medium">{tAny(system.direction)}</dd>
              </dl>
              {system.id === "billing" && (
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={testBilling} disabled={probe.status === "checking"}>
                    {probe.status === "checking" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {t("Test connection")}
                  </Button>
                  <div aria-live="polite" className="text-sm">
                    {probe.status === "ok" && (
                      <p className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        {t("Responding in {ms} ms ({count} sample invoices)", { ms: probe.ms, count: probe.count })}
                      </p>
                    )}
                    {probe.status === "failed" && (
                      <p className="flex items-center gap-1.5 text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        {probe.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Hospital settings */

function SettingsPanel({ settings }: { settings: SystemSettings }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <HospitalProfileForm settings={settings} />
      <DemoDataCard />
    </div>
  );
}

function HospitalProfileForm({ settings }: { settings: SystemSettings }) {
  const t = useT(ADMIN_SYSTEM_KM);
  const [name, setName] = useState(settings.hospitalName);
  const [nameKhmer, setNameKhmer] = useState(settings.hospitalNameKhmer);
  const [type, setType] = useState(settings.hospitalType);
  const [saved, setSaved] = useState(false);
  const dirty = name !== settings.hospitalName || nameKhmer !== settings.hospitalNameKhmer || type !== settings.hospitalType;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveSystemSettings({ hospitalName: name.trim(), hospitalNameKhmer: nameKhmer.trim(), hospitalType: type });
    setSaved(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          {t("Hospital profile")}
        </CardTitle>
        <CardDescription>{t("Shown on the Admin Console and, later, on printed documents.")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospital-name">{t("Hospital name (English)")}</Label>
            <Input id="hospital-name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospital-name-km">{t("Hospital name (Khmer)")}</Label>
            <Input id="hospital-name-km" lang="km" value={nameKhmer} onChange={(e) => { setNameKhmer(e.target.value); setSaved(false); }} />
          </div>
          <div className="space-y-2">
            <Label id="hospital-type-label">{t("Hospital type")}</Label>
            <RadioGroup
              aria-labelledby="hospital-type-label"
              value={type}
              onValueChange={(v) => { setType(v as SystemSettings["hospitalType"]); setSaved(false); }}
              className="grid grid-cols-2 gap-3"
            >
              {(["public", "private"] as const).map((value) => (
                <Label
                  key={value}
                  htmlFor={`hospital-type-${value}`}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal", type === value && "border-primary bg-primary/5")}
                >
                  <RadioGroupItem id={`hospital-type-${value}`} value={value} />
                  {value === "public" ? t("Public") : t("Private")}
                </Label>
              ))}
            </RadioGroup>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!dirty || !name.trim()}>
              {t("Save changes")}
            </Button>
            {saved && !dirty && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700" role="status">
                <CheckCircle2 className="h-4 w-4" />
                {t("Saved")}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DemoDataCard() {
  const t = useT(ADMIN_SYSTEM_KM);
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    resetAllDemoData();
    // Services keep their collections in memory, so reload to start again from the sample data.
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          {t("Demo data")}
        </CardTitle>
        <CardDescription>
          {t("Patients, appointments, visits and consents added during a demo are saved in this browser.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("Reset before each walkthrough so every reviewer starts from the same sample patients. Hospital settings are kept.")}
        </p>
        <Button variant="outline" onClick={() => setConfirming(true)}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t("Reset demo data")}
        </Button>
      </CardContent>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Reset demo data?")}</DialogTitle>
            <DialogDescription>
              {t("Everything added or changed in this browser (patients, appointments, visits, consents) is removed and the original sample data comes back. This cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              {t("Cancel")}
            </Button>
            <Button variant="destructive" onClick={reset}>
              {t("Reset demo data")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
