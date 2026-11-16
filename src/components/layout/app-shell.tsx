"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { AccessDenied } from "@/components/layout/access-denied";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { useAccess } from "@/lib/access";
import { canAccessPath } from "@/lib/permissions";

/** Only allow same-site relative redirects (guards against open-redirect via ?next=). */
export function safeNextPath(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, user, log } = useAccess();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/login";
  const allowed = canAccessPath(user?.role, pathname);

  useEffect(() => {
    if (!ready) return;
    if (!user && !onLogin) {
      const here = window.location.pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    } else if (user && onLogin) {
      router.replace(safeNextPath(new URLSearchParams(window.location.search).get("next")));
    }
  }, [ready, user, onLogin, router]);

  // Record blocked navigation once per page visit
  useEffect(() => {
    if (ready && user && !allowed) {
      log({ action: "access.denied", summary: `Tried to open ${pathname}`, entityType: "page", entityId: pathname });
    }
  }, [ready, user, allowed, pathname, log]);

  if (onLogin) return <>{children}</>;
  if (!ready || !user) return <PageSkeleton />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-64">
        <TopBar />
        <main>{allowed ? children : <AccessDenied role={user.role} />}</main>
      </div>
    </div>
  );
}
