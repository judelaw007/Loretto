"use client";

import { AuthProvider } from "@loretto/firebase-config";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
