"use client";

import { useAuthContext } from "@loretto/firebase-config";

export default function UnauthorizedPage() {
  const { signOut } = useAuthContext();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        Your account does not have permission to access the Student Dashboard.
      </p>
      <button
        onClick={signOut}
        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Sign out
      </button>
    </main>
  );
}
