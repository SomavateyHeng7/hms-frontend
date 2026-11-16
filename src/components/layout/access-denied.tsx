import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLE_LABELS, type Role } from "@/lib/permissions";

export function AccessDenied({ role, what }: { role: Role; what?: string }) {
  return (
    <div className="container mx-auto max-w-xl px-4 py-16">
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        description={`${what ?? "This area"} isn't available to the ${ROLE_LABELS[role]} role. If you need it, ask an administrator. This attempt has been recorded.`}
        action={
          <Button asChild>
            <Link href="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
