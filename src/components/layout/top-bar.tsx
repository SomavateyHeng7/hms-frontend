"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClinicalData } from "@/lib/clinical-store";
import { UserMenu } from "@/components/layout/user-menu";

export function TopBar() {
  const router = useRouter();
  const { patients, criticalAlerts } = useClinicalData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients
      .filter((p) =>
        [`${p.firstName} ${p.lastName}`, p.patientId, p.phone, p.email ?? ""].some((field) =>
          field.toLowerCase().includes(q)
        )
      )
      .slice(0, 6);
  }, [patients, query]);

  // Ctrl/Cmd+K focuses the search box
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      router.push(`/patients/${results[activeIndex].id}`);
      close();
    } else if (e.key === "Escape") {
      close();
      inputRef.current?.blur();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 pl-16 pr-4 backdrop-blur lg:pl-6">
      <div ref={containerRef} className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search patients by name, ID or phone…"
          aria-label="Search patients"
          className="pl-9 pr-14"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border px-1.5 text-[10px] text-muted-foreground sm:block">
          Ctrl K
        </kbd>

        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-md border bg-popover shadow-md">
            {results.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">No patients found</p>
            ) : (
              <ul role="listbox">
                {results.map((p, index) => (
                  <li key={p.id} role="option" aria-selected={index === activeIndex}>
                    <Link
                      href={`/patients/${p.id}`}
                      onClick={close}
                      className={`flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent ${
                        index === activeIndex ? "bg-accent" : ""
                      }`}
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate font-medium">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.patientId}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
      {criticalAlerts.length > 0 && (
        <Link
          href="/laboratory?tab=results"
          className="flex shrink-0 items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
          aria-label={`${criticalAlerts.length} unacknowledged critical lab ${criticalAlerts.length === 1 ? "value" : "values"}`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">
            {criticalAlerts.length} critical {criticalAlerts.length === 1 ? "value" : "values"}
          </span>
          <span className="sm:hidden">{criticalAlerts.length}</span>
        </Link>
      )}
      <UserMenu />
      </div>
    </header>
  );
}
