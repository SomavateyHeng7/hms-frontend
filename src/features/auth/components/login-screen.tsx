"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  FlaskConical,
  HeartPulse,
  HelpCircle,
  Loader2,
  Lock,
  Settings,
  Stethoscope,
  User,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher, ThemeToggle } from "@/components/layout/top-nav";
import { useCurrentYear } from "@/hooks/use-current-year";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { useSystemSettings } from "@/features/admin/system/system-settings";

/**
 * Sign-in screen. UI only in the prototype: any password is accepted and nothing is checked
 * against a server. `?login=error` shows the wrong-password state for walkthroughs, and
 * `?next=/some/page` returns the user to the page they came from.
 */

interface DemoRole {
  key: string;
  label: TranslationKey;
  staffId: string;
  home: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEMO_ROLES: DemoRole[] = [
  { key: "front-desk", label: "login.role.frontDesk", staffId: "STF-0101", home: "/front-desk/patients", icon: Users },
  { key: "doctor", label: "login.role.doctor", staffId: "STF-0204", home: "/doctor/opd", icon: Stethoscope },
  { key: "nurse", label: "login.role.nurse", staffId: "STF-0311", home: "/nursing/inpatient", icon: UserRound },
  { key: "lab", label: "login.role.lab", staffId: "STF-0420", home: "/diagnostics/laboratory", icon: FlaskConical },
  { key: "admin", label: "login.role.admin", staffId: "STF-0001", home: "/admin", icon: Settings },
];

const BRAND_POINTS: TranslationKey[] = ["login.point.secure", "login.point.language", "login.point.hospitals"];

export function LoginScreen() {
  const { t, language } = useLanguage();
  const year = useCurrentYear();
  const settings = useSystemSettings();
  const hospitalName = language === "km" && settings.hospitalNameKhmer ? settings.hospitalNameKhmer : settings.hospitalName;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel (large screens) */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground dark:bg-gradient-to-br dark:from-blue-950 dark:via-slate-900 dark:to-slate-950 dark:text-blue-50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0), radial-gradient(circle at 80% 10%, currentColor 0, transparent 40%)",
            backgroundSize: "24px 24px, 100% 100%",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-10 right-40 h-40 w-40 rounded-full bg-white/5" />

        <Link href="/" className="relative flex items-center gap-3 font-semibold" aria-label={t("nav.home")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <HeartPulse className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg">{t("app.name")}</span>
            <span className="block text-sm font-normal opacity-80">{hospitalName}</span>
          </span>
        </Link>

        <div className="relative max-w-md space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">{t("login.brandTitle")}</h2>
          <p className="text-lg opacity-85">{t("login.brandBody")}</p>
          <ul className="space-y-3">
            {BRAND_POINTS.map((key) => (
              <li key={key} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 opacity-90" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm opacity-75">{t("home.footer").replace("{year}", String(year))}</p>
      </aside>

      {/* Form side */}
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-3 px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden" aria-label={t("nav.home")}>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="text-lg">{t("app.name")}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary lg:hidden">{hospitalName}</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("login.title")}</h1>
              <p className="text-muted-foreground">{t("login.subtitle")}</p>
            </div>
            <LoginForm />
            <p className="text-center text-sm text-muted-foreground">{t("login.help")}</p>
          </div>
        </main>

        <footer className="border-t px-4 py-5 text-center text-sm text-muted-foreground lg:hidden">
          {t("home.footer").replace("{year}", String(year))}
        </footer>
      </div>
    </div>
  );
}

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();

  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [role, setRole] = useState<DemoRole | null>(null);
  const [errors, setErrors] = useState<{ staffId?: TranslationKey; password?: TranslationKey }>({});
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickRole = (r: DemoRole) => {
    setRole(r);
    setStaffId(r.staffId);
    setPassword("demo-password");
    setErrors({});
    setFailed(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!staffId.trim()) next.staffId = "login.required.staffId";
    if (!password) next.password = "login.required.password";
    setErrors(next);
    setFailed(false);
    if (next.staffId || next.password) {
      document.getElementById(next.staffId ? "staff-id" : "password")?.focus();
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (params.get("login") === "error") {
      setSubmitting(false);
      setFailed(true);
      setPassword("");
      document.getElementById("password")?.focus();
      return;
    }
    const requested = params.get("next");
    const destination =
      requested && requested.startsWith("/") && !requested.startsWith("//")
        ? requested
        : (role ?? DEMO_ROLES.find((r) => r.staffId === staffId.trim().toUpperCase()) ?? DEMO_ROLES[0]).home;
    router.push(destination);
  };

  const trackCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <div className="space-y-8">
      <form onSubmit={submit} noValidate className="space-y-5">
        {failed && (
          <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {t("login.error")}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="staff-id">{t("login.staffId")}</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="staff-id"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={t("login.staffIdPlaceholder")}
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setRole(null);
                if (errors.staffId) setErrors((p) => ({ ...p, staffId: undefined }));
              }}
              aria-invalid={!!errors.staffId}
              aria-describedby={errors.staffId ? "staff-id-error" : undefined}
              className={cn("h-11 pl-9", errors.staffId && "border-destructive focus-visible:ring-destructive")}
            />
          </div>
          {errors.staffId && (
            <p id="staff-id-error" className="text-sm text-destructive">
              {t(errors.staffId)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">{t("login.password")}</Label>
            <button
              type="button"
              onClick={() => setShowForgot((v) => !v)}
              aria-expanded={showForgot}
              aria-controls="forgot-help"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("login.forgot")}
            </button>
          </div>
          {showForgot && (
            <p id="forgot-help" className="flex gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {t("login.forgotHelp")}
            </p>
          )}
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
              onKeyDown={trackCapsLock}
              onKeyUp={trackCapsLock}
              onBlur={() => setCapsLock(false)}
              aria-invalid={!!errors.password}
              aria-describedby={[errors.password && "password-error", capsLock && "caps-lock"].filter(Boolean).join(" ") || undefined}
              className={cn("h-11 pl-9 pr-11", errors.password && "border-destructive focus-visible:ring-destructive")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
              aria-pressed={showPassword}
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {capsLock && (
            <p id="caps-lock" className="text-sm text-amber-700">
              {t("login.capsLock")}
            </p>
          )}
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {t(errors.password)}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} className="mt-0.5" aria-describedby="remember-hint" />
          <div className="space-y-0.5">
            <Label htmlFor="remember" className="font-normal">
              {t("login.remember")}
            </Label>
            <p id="remember-hint" className="text-xs text-muted-foreground">
              {t("login.rememberHint")}
            </p>
          </div>
        </div>

        <Button type="submit" className="h-11 w-full text-base" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>

      {/* Prototype helper: lets reviewers enter as each kind of user. Remove with real accounts. */}
      <section aria-labelledby="demo-roles" className="rounded-xl border border-dashed p-4">
        <h2 id="demo-roles" className="text-sm font-medium">
          {t("login.demoTitle")}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("login.demoHint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => pickRole(r)}
              aria-pressed={role?.key === r.key}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-primary/60 hover:bg-accent",
                role?.key === r.key && "border-primary bg-primary/10 text-primary"
              )}
            >
              <r.icon className="h-3.5 w-3.5" />
              {t(r.label)}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
