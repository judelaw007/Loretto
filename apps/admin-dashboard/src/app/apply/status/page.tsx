"use client";

import { useState, type FormEvent } from "react";
import type { ApplicationStatus } from "@loretto/shared-types";

interface StatusResult {
  id: string;
  status: ApplicationStatus;
  childrenCount: number;
  createdAt: string;
}

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<StatusResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResults(null);
    setLoading(true);

    try {
      // Determine functions base URL (emulator or production)
      const useEmulators =
        process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const baseUrl = useEmulators
        ? `http://127.0.0.1:5001/${projectId}/us-central1`
        : `https://us-central1-${projectId}.cloudfunctions.net`;

      const res = await fetch(`${baseUrl}/checkApplicationStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to check status");
      }

      const data = await res.json();
      setResults(data.applications ?? []);
    } catch {
      setError("Unable to check status. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Application Status</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the email address you used when applying to check your
          application status.
        </p>
      </div>

      <form onSubmit={handleCheck} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <div>
          <label htmlFor="statusEmail" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="statusEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="parent@example.com"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>

      {results !== null && (
        <div className="mt-8 space-y-4">
          {results.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No applications found for this email address.
            </p>
          ) : (
            results.map((app) => (
              <div key={app.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400">{app.id}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[app.status]}`}
                  >
                    {statusLabels[app.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {app.childrenCount} child{app.childrenCount !== 1 ? "ren" : ""}
                </p>
                <p className="text-xs text-gray-400">
                  Submitted: {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        <a
          href="/apply"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          &larr; Submit a new application
        </a>
      </div>
    </div>
  );
}
