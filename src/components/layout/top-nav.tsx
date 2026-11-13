"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { HeartPulse, LogIn, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Language } from "@/lib/i18n/dictionaries";
import { useSidebarState } from "./sidebar-state";

const LANGUAGE_LABELS: Record<Language, { label: string; lang: string }> = {
  en: { label: "EN", lang: "en" },
  km: { label: "ខ្មែរ", lang: "km" },
};

// True only in the browser; the theme is unknown during server rendering.
const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div role="group" aria-label={t("nav.language")} className="flex items-center rounded-md border p-0.5">
      {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
        <button
          key={lang}
          type="button"
          lang={LANGUAGE_LABELS[lang].lang}
          aria-pressed={language === lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            "rounded px-2.5 py-1 text-sm font-medium transition-colors",
            language === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LANGUAGE_LABELS[lang].label}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const isClient = useIsClient();
  const isDark = isClient && resolvedTheme === "dark";
  const label = isDark ? t("nav.theme.toLight") : t("nav.theme.toDark");

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={label} title={label}>
      {/* Render both icons until the theme is known, so server and client markup match. */}
      <Sun className={cn("h-5 w-5", isClient && !isDark && "hidden")} />
      <Moon className={cn("h-5 w-5", (!isClient || isDark) && "hidden")} />
    </Button>
  );
}

export function TopNav() {
  const { t } = useLanguage();
  const sidebar = useSidebarState();

  return (
    <header className="sticky top-0 z-50 h-14 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-full items-center gap-3 px-4">
        {sidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => sidebar.setOpen(!sidebar.open)}
            aria-label={sidebar.open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={sidebar.open}
          >
            {sidebar.open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}

        <Link href="/" className="flex items-center gap-2 font-semibold" aria-label={t("nav.home")}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="text-lg">{t("app.name")}</span>
          <span className="hidden text-sm font-normal text-muted-foreground md:inline">{t("app.fullName")}</span>
        </Link>

        <span className="ml-2 hidden rounded-full border px-2 py-0.5 text-xs text-muted-foreground sm:inline">{t("nav.prototype")}</span>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {sidebar ? (
            <Button asChild variant="ghost" size="icon" aria-label={t("nav.signOut")} title={t("nav.signOut")}>
              <Link href="/login">
                <LogOut className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                {t("nav.signIn")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
