"use client";

import { useCallback } from "react";
import { format as formatDate } from "date-fns";
import { km as khmerLocale } from "date-fns/locale";
import { useLanguage } from "./language-provider";
import { COMMON_KM } from "./common-km";
import { VALIDATION_KM } from "./validation-km";

/**
 * Screen text for the work modules (roadmap F4).
 *
 * The English text is the key: components write `t("Register patient")`, and each module keeps
 * a Khmer file mapping that English text to Khmer. `t` only accepts text that has a Khmer
 * entry (in the module file or in COMMON_KM), so `tsc` fails if a screen shows English with
 * no translation. Placeholders use braces: `t("{count} patients", { count })`.
 *
 * Khmer wording needs review by a Khmer-speaking clinician before the pilot.
 */

export type KhmerMessages = Record<string, string>;
type Vars = Record<string, string | number | null | undefined>;

const fill = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name] ?? "") : match)) : text;

export { defineKhmer } from "./define";

export function useT<T extends KhmerMessages>(moduleKm?: T) {
  const { language } = useLanguage();
  return useCallback(
    (key: Extract<keyof T | keyof typeof COMMON_KM, string>, vars?: Vars) => {
      const text = language === "km" ? (moduleKm?.[key] ?? (COMMON_KM as KhmerMessages)[key] ?? key) : key;
      return fill(text, vars);
    },
    [language, moduleKm]
  );
}

/**
 * For text that is only known at run time, such as validation messages from zod schemas or
 * values stored in records. Falls back to the original text when there is no translation.
 */
export function useTranslateAny(moduleKm?: KhmerMessages) {
  const { language } = useLanguage();
  return useCallback(
    (text: string | undefined, vars?: Vars) => {
      if (!text) return "";
      const translated = language === "km" ? (moduleKm?.[text] ?? COMMON_KM[text as keyof typeof COMMON_KM] ?? VALIDATION_KM[text] ?? text) : text;
      return fill(translated, vars);
    },
    [language, moduleKm]
  );
}

/** Dates in the reader's language, e.g. `formatDate(date, "PPP")`. Digits stay Western (0-9) for clinical safety. */
export function useDateFormat() {
  const { language } = useLanguage();
  return useCallback(
    (date: Date | string | number | undefined | null, pattern = "PP") => {
      if (date === undefined || date === null || date === "") return "";
      const value = date instanceof Date ? date : new Date(date);
      if (Number.isNaN(value.getTime())) return "";
      return formatDate(value, pattern, language === "km" ? { locale: khmerLocale } : undefined);
    },
    [language]
  );
}
