"use client";

import { useMe } from "@/queries/auth.queries";

export function AuthSessionCheck({ children }: { children: React.ReactNode }) {
  // useMe() automatically fires when isAuthenticated is true
  // and fetches /me to restore the user profile from token
  useMe();

  return <>{children}</>;
}
