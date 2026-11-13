"use client";

import { createContext, useContext, useState } from "react";

/** Open/closed state of the mobile sidebar, shared by the top bar's menu button and the sidebar. */
const SidebarStateContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function SidebarStateProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SidebarStateContext.Provider value={{ open, setOpen }}>{children}</SidebarStateContext.Provider>;
}

/** Returns null outside a page with a sidebar (e.g. the home page). */
export function useSidebarState() {
  return useContext(SidebarStateContext);
}
