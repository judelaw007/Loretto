"use client";

import { useEffect } from "react";
import { useAuthContext } from "@loretto/firebase-config";

export default function Home() {
  const { firebaseUser, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;
    if (firebaseUser) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  }, [firebaseUser, loading]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </main>
  );
}
