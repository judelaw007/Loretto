"use client";

import { useEffect } from "react";
import { useAuthContext, signIn } from "@loretto/firebase-config";
import { LoginForm } from "@loretto/shared-ui";

export default function AdminLoginPage() {
  const { firebaseUser, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && firebaseUser) {
      window.location.href = "/dashboard";
    }
  }, [firebaseUser, loading]);

  async function handleLogin(email: string, password: string) {
    await signIn({ email, password });
  }

  return (
    <LoginForm
      title="Loretto Admin"
      subtitle="Sign in to the admin dashboard"
      onSubmit={handleLogin}
    />
  );
}
