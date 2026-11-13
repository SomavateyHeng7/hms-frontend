"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Keeps a page's active tab in the `?tab=` URL parameter, so sidebar links such as
 * `/nursing/inpatient?tab=beds` open the right tab and the browser back button works.
 * Unknown values fall back to `defaultTab`.
 */
export function useTabParam<T extends string>(defaultTab: T, tabs: readonly T[]) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const raw = params.get("tab");
  const tab = raw && (tabs as readonly string[]).includes(raw) ? (raw as T) : defaultTab;

  const setTab = useCallback(
    (next: string) => {
      const search = new URLSearchParams(params.toString());
      if (next === defaultTab) search.delete("tab");
      else search.set("tab", next);
      const query = search.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, router, pathname, defaultTab]
  );

  return [tab, setTab] as const;
}
