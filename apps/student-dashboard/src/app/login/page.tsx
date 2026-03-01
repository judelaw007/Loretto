"use client";

import { useEffect } from "react";
import { useAuthContext, signIn } from "@loretto/firebase-config";
import { LoginForm } from "@loretto/shared-ui";

export default function StudentLoginPage() {
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
      title="Loretto Student Portal"
      subtitle="Sign in to access your courses"
      onSubmit={handleLogin}
    />
  );
}
