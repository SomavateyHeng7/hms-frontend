"use client";

import Link from "next/link";
import { useCurrentYear } from "@/hooks/use-current-year";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  HeartPulse,
  Languages,
  ListOrdered,
  MapPin,
  Microscope,
  QrCode,
  ShieldCheck,
  Stethoscope,
  TestTube,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/layout/top-nav";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

interface WorkArea {
  title: TranslationKey;
  description: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  modules: { label: TranslationKey; href: string }[];
}

const WORK_AREAS: WorkArea[] = [
  {
    title: "home.area.frontDesk",
    description: "home.area.frontDesk.desc",
    icon: Users,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    modules: [
      { label: "home.module.patients", href: "/front-desk/patients" },
      { label: "home.module.queue", href: "/front-desk/queue" },
      { label: "home.module.scheduling", href: "/front-desk/scheduling" },
    ],
  },
  {
    title: "home.area.doctor",
    description: "home.area.doctor.desc",
    icon: Stethoscope,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    modules: [
      { label: "home.module.opd", href: "/doctor/opd" },
      { label: "home.module.medicalRecords", href: "/doctor/medical-records" },
    ],
  },
  {
    title: "home.area.nursing",
    description: "home.area.nursing.desc",
    icon: HeartPulse,
    accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    modules: [
      { label: "home.module.inpatient", href: "/nursing/inpatient" },
      { label: "home.module.emergency", href: "/nursing/emergency" },
      { label: "home.module.operationTheater", href: "/nursing/operation-theater" },
    ],
  },
  {
    title: "home.area.diagnostics",
    description: "home.area.diagnostics.desc",
    icon: Microscope,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    modules: [
      { label: "home.module.laboratory", href: "/diagnostics/laboratory" },
      { label: "home.module.radiology", href: "/diagnostics/radiology" },
      { label: "home.module.bloodBank", href: "/diagnostics/blood-bank" },
    ],
  },
  {
    title: "home.area.support",
    description: "home.area.support.desc",
    icon: Truck,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    modules: [
      { label: "home.module.cssd", href: "/support/cssd" },
      { label: "home.module.diet", href: "/support/diet" },
      { label: "home.module.ambulance", href: "/support/ambulance" },
    ],
  },
  {
    title: "home.area.admin",
    description: "home.area.admin.desc",
    icon: BarChart3,
    accent: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    modules: [
      { label: "home.module.staff", href: "/admin/staff" },
      { label: "home.module.reporting", href: "/admin/reporting" },
    ],
  },
];

/** The outpatient journey the system supports, in order. */
const JOURNEY: { label: TranslationKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "home.module.patients", icon: UserRound },
  { label: "home.module.queue", icon: ListOrdered },
  { label: "home.module.opd", icon: Stethoscope },
  { label: "home.module.laboratory", icon: TestTube },
  { label: "home.module.medicalRecords", icon: ClipboardList },
];

const HIGHLIGHTS: { title: TranslationKey; description: TranslationKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { title: "home.highlight.language.title", description: "home.highlight.language.desc", icon: Languages },
  { title: "home.highlight.coverage.title", description: "home.highlight.coverage.desc", icon: ShieldCheck },
  { title: "home.highlight.identity.title", description: "home.highlight.identity.desc", icon: MapPin },
];

export default function HomePage() {
  const { t } = useLanguage();
  const year = useCurrentYear();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" aria-hidden />
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
                <HeartPulse className="h-4 w-4 text-primary" />
                {t("home.eyebrow")}
              </span>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("home.title")}</h1>
              <p className="max-w-xl text-lg text-muted-foreground">{t("home.subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/front-desk/patients">
                    {t("home.ctaFrontDesk")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/front-desk/patients?view=check-in">
                    <QrCode className="mr-2 h-4 w-4" />
                    {t("home.ctaCheckIn")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Patient journey */}
            <ol className="rounded-xl border bg-card p-6 shadow-sm">
              {JOURNEY.map((step, i) => (
                <li key={step.label} className="relative flex items-center gap-4 pb-6 last:pb-0">
                  {i < JOURNEY.length - 1 && <span className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-px bg-border" aria-hidden />}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-medium">{t(step.label)}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Work areas */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">{t("home.areasTitle")}</h2>
            <p className="text-muted-foreground">{t("home.areasSubtitle")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORK_AREAS.map((area) => (
              <div key={area.title} className="flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${area.accent}`}>
                    <area.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{t(area.title)}</h3>
                    <p className="text-sm text-muted-foreground">{t(area.description)}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-1 border-t pt-3">
                  {area.modules.map((m) => (
                    <li key={m.href}>
                      <Link
                        href={m.href}
                        className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        {t(m.label)}
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">{t("home.highlightsTitle")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="space-y-2">
                  <h.icon className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">{t(h.title)}</h3>
                  <p className="text-sm text-muted-foreground">{t(h.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        {t("home.footer").replace("{year}", String(year))}
      </footer>
    </div>
  );
}
