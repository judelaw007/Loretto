"use client";

import { AuthGuard } from "@loretto/shared-ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["student"]}>
      {children}
    </AuthGuard>
  );
}
