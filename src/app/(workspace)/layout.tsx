import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarStateProvider } from "@/components/layout/sidebar-state";
import { TopNav } from "@/components/layout/top-nav";

/** Layout for every working page: top bar + sidebar. The home page uses its own layout without a sidebar. */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarStateProvider>
      <TopNav />
      <Suspense>
        <Sidebar />
      </Suspense>
      <main className="min-h-[calc(100vh-3.5rem)] lg:pl-64">
        {/* Suspense lets client components read ?tab= (useSearchParams) on static pages */}
        <Suspense>{children}</Suspense>
      </main>
    </SidebarStateProvider>
  );
}
