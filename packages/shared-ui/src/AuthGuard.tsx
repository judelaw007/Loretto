"use client";

import { useEffect } from "react";
import { useAuthContext } from "@loretto/firebase-config";
import type { UserRole } from "@loretto/shared-types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  loginPath?: string;
  unauthorizedPath?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  loginPath = "/login",
  unauthorizedPath = "/unauthorized",
}: AuthGuardProps) {
  const { claims, loading, firebaseUser } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    if (!firebaseUser) {
      window.location.href = loginPath;
      return;
    }

    if (claims && !allowedRoles.includes(claims.role)) {
      window.location.href = unauthorizedPath;
    }
  }, [loading, firebaseUser, claims, allowedRoles, loginPath, unauthorizedPath]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!firebaseUser || !claims || !allowedRoles.includes(claims.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
