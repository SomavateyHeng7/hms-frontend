"use client";

import { useSyncExternalStore } from "react";

// Pages are prerendered at build time, so the build year (fixed in next.config.ts) is only the
// first paint; the browser then renders the current year, so footers update every January.
const BUILD_YEAR = Number(process.env.NEXT_PUBLIC_BUILD_YEAR);
const subscribeNever = () => () => {};

export const useCurrentYear = () => useSyncExternalStore(subscribeNever, () => new Date().getFullYear(), () => BUILD_YEAR);
