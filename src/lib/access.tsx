"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEMO_USERS, can as roleCan, findDemoUser, type DemoUser, type Permission } from "@/lib/permissions";
import { capAudit, type AuditEntry, type AuditEntryInput } from "@/lib/audit";

/**
 * Demo sign-in, permission checks and the audit log.
 *
 * Everything lives in this browser (the session and audit log are kept in localStorage),
 * so none of it is real security: there are no passwords and anyone with the device can
 * edit storage. A real deployment needs server-side authentication, authorization and an
 * append-only audit store.
 */

const SESSION_KEY = "hms.session.v1";
const AUDIT_KEY = "hms.audit.v1";

interface AccessContextValue {
  /** False until the saved session has been read (avoids a flash of the login screen). */
  ready: boolean;
  user: DemoUser | null;
  login: (userId: string) => boolean;
  logout: () => void;
  can: (permission: Permission) => boolean;
  /** Records an action by the signed-in user (or `actor` when given). */
  log: (entry: AuditEntryInput, actor?: Pick<DemoUser, "id" | "name" | "role">) => void;
  /** Newest first */
  auditLog: AuditEntry[];
}

const AccessContext = createContext<AccessContextValue | null>(null);

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or blocked (private mode); the in-memory copy still works.
  }
}

let seq = 0;
const auditId = () => `AUD-${Date.now().toString(36)}-${(++seq).toString(36)}`;

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const userRef = useRef<DemoUser | null>(null);
  userRef.current = user;

  // Restore session and audit log after mount (localStorage isn't available during SSR).
  useEffect(() => {
    const saved = findDemoUser(readStorage<string>(SESSION_KEY));
    if (saved) setUser(saved);
    setAuditLog(readStorage<AuditEntry[]>(AUDIT_KEY) ?? []);
    setReady(true);
  }, []);

  // Persist the audit log once the saved copy has been loaded.
  useEffect(() => {
    if (ready) writeStorage(AUDIT_KEY, auditLog);
  }, [auditLog, ready]);

  const log = useCallback<AccessContextValue["log"]>((entry, actor) => {
    const who = actor ?? userRef.current;
    const record: AuditEntry = {
      ...entry,
      id: auditId(),
      timestamp: new Date().toISOString(),
      userId: who?.id ?? "anonymous",
      userName: who?.name ?? "Anonymous",
      role: who?.role ?? "anonymous",
    };
    setAuditLog((prev) => capAudit([record, ...prev]));
  }, []);

  const login = useCallback(
    (userId: string) => {
      const next = DEMO_USERS.find((u) => u.id === userId);
      if (!next) return false;
      writeStorage(SESSION_KEY, next.id);
      setUser(next);
      log({ action: "auth.login", summary: `${next.name} signed in` }, next);
      return true;
    },
    [log]
  );

  const logout = useCallback(() => {
    const current = userRef.current;
    if (current) log({ action: "auth.logout", summary: `${current.name} signed out` }, current);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, [log]);

  const can = useCallback((permission: Permission) => roleCan(user?.role, permission), [user]);

  const value = useMemo<AccessContextValue>(
    () => ({ ready, user, login, logout, can, log, auditLog }),
    [ready, user, login, logout, can, log, auditLog]
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessContextValue {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used within an AccessProvider");
  return ctx;
}
