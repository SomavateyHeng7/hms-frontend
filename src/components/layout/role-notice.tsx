import { Lock } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/permissions";

/** Explains why some actions are disabled for the signed-in role. Render nothing when `limits` is empty. */
export function RoleNotice({ role, limits }: { role: Role; limits: string[] }) {
  if (limits.length === 0) return null;
  return (
    <div role="note" className="mb-4 flex items-start gap-2 rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
      <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        Signed in as <strong>{ROLE_LABELS[role]}</strong> — {limits.join("; ")}.
      </p>
    </div>
  );
}
