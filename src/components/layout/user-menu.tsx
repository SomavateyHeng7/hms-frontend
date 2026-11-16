"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccess } from "@/lib/access";
import { DEMO_USERS, ROLE_LABELS } from "@/lib/permissions";

export function UserMenu() {
  const { user, login, logout } = useAccess();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
      >
        <span className="hidden max-w-40 truncate font-medium sm:inline">{user.name}</span>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {ROLE_LABELS[user.role]}
        </Badge>
        <span className="sm:hidden">{user.name.split(" ")[0]}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-md border bg-popover shadow-md">
          <p className="border-b px-3 py-2 text-xs text-muted-foreground">Switch demo account</p>
          <ul className="max-h-72 overflow-y-auto py-1">
            {DEMO_USERS.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    if (u.id !== user.id) login(u.id);
                    setOpen(false);
                    router.refresh();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="flex-1">
                    <span className="block font-medium">{u.name}</span>
                    <span className="block text-xs text-muted-foreground">{ROLE_LABELS[u.role]}</span>
                  </span>
                  {u.id === user.id && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
