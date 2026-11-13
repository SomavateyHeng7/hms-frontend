import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginScreen } from "@/features/auth/components/login-screen";

export const metadata: Metadata = { title: "Sign in · HMS" };

/** Sign-in screen, outside the workspace layout (no sidebar). Design only for now: no real authentication. */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
