"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { dictionaries, LANGUAGES, type Language, type TranslationKey } from "./dictionaries";

const STORAGE_KEY = "hms-language";
const CHANGE_EVENT = "hms-language-change";

// The chosen language lives in localStorage; this tiny store lets every component read it
// without a hydration mismatch (the server always renders English first).
// Fallback when localStorage is blocked (private windows): the choice lasts for this page.
let memoryLanguage: Language | null = null;

function readLanguage(): Language {
  if (memoryLanguage) return memoryLanguage;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved && (LANGUAGES as string[]).includes(saved) ? (saved as Language) : "en";
  } catch {
    return "en";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, readLanguage, () => "en" as Language);

  const setLanguage = useCallback((next: Language) => {
    memoryLanguage = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked: memoryLanguage keeps the choice until the page is reloaded.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  // Khmer text gets the Khmer font and line height through the :lang(km) CSS rule.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: (key) => dictionaries[language][key] }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
