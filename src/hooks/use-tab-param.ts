"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Tab state that can be deep-linked with `?tab=<value>`.
 * Falls back to `defaultTab` when the param is missing or not a valid tab.
 * Components using this must be rendered inside a <Suspense> boundary.
 */
export function useTabParam(defaultTab: string, validTabs: readonly string[]) {
  const searchParams = useSearchParams();
  const paramTab = searchParams.get("tab");
  const initial = paramTab && validTabs.includes(paramTab) ? paramTab : defaultTab;
  const [tab, setTab] = useState(initial);

  useEffect(() => {
    setTab(paramTab && validTabs.includes(paramTab) ? paramTab : defaultTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramTab]);

  return [tab, setTab] as const;
}
