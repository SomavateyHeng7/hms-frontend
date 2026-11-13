"use client";

import { useSyncExternalStore } from "react";
import { MODULES, type ModuleId } from "./module-registry";

/**
 * Hospital-wide settings chosen in the Admin Console. Stored in this browser only for the
 * prototype; a backend will own them later. Kept apart from the demo data so "reset demo
 * data" does not undo the hospital's configuration.
 */
export interface SystemSettings {
  hospitalName: string;
  hospitalNameKhmer: string;
  hospitalType: "public" | "private";
  disabledModules: ModuleId[];
}

const STORAGE_KEY = "hms-settings:v1";
const CHANGE_EVENT = "hms-settings-change";

export const DEFAULT_SETTINGS: SystemSettings = {
  hospitalName: "Demo Referral Hospital",
  hospitalNameKhmer: "មន្ទីរពេទ្យបង្អែកសាកល្បង",
  hospitalType: "public",
  disabledModules: [],
};

let cachedRaw: string | null | undefined;
let cached: SystemSettings = DEFAULT_SETTINGS;

function read(): SystemSettings {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: use the in-memory copy.
    return cached;
  }
  // useSyncExternalStore needs the same object back while nothing changed.
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<SystemSettings>) : {};
    const known = new Set(MODULES.map((m) => m.id));
    cached = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      disabledModules: (parsed.disabledModules ?? []).filter((id) => known.has(id)),
    };
  } catch {
    cached = DEFAULT_SETTINGS;
  }
  return cached;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function saveSystemSettings(changes: Partial<SystemSettings>) {
  const next = { ...read(), ...changes };
  cached = next;
  try {
    cachedRaw = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // Keep working from memory.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setModuleEnabled(id: ModuleId, enabled: boolean) {
  const disabled = new Set(read().disabledModules);
  if (enabled) disabled.delete(id);
  else disabled.add(id);
  saveSystemSettings({ disabledModules: [...disabled] });
}

/** Current settings; the server render and first paint use the defaults. */
export function useSystemSettings(): SystemSettings {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_SETTINGS);
}
