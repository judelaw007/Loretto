"use client";

import { useAuthContext } from "@loretto/firebase-config";

export default function DashboardPage() {
  const { user, claims, signOut } = useAuthContext();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
      <p className="text-gray-600 mb-1">
        Welcome, {user?.displayName ?? "Student"}
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Role: {claims?.role}
      </p>
      <button
        onClick={signOut}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Sign out
      </button>
    </main>
  );
}
