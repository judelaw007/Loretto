"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  getDocument,
  updateDocument,
  callFunction,
  serverTimestamp,
} from "@loretto/firebase-config";
import { useAuthContext } from "@loretto/firebase-config";
import type { Application, ApplicationStatus, School } from "@loretto/shared-types";

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

interface ApproveResult {
  parentPassword: string;
  parentUid: string;
  childrenUids: string[];
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthContext();

  const [application, setApplication] = useState<(Application & { id: string }) | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review state
  const [reviewStatus, setReviewStatus] = useState<ApplicationStatus>("under_review");
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  // Password modal
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const app = await getDocument<Application>("applications", id);
        if (!app) {
          setError("Application not found.");
          setLoading(false);
          return;
        }
        setApplication(app);
        setReviewNotes(app.reviewNotes ?? "");

        if (app.schoolId) {
          const school = await getDocument<School>("schools", app.schoolId);
          if (school) setSchoolName(`${school.name} — ${school.branch}`);
        }
      } catch {
        setError("Failed to load application.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSaveReview() {
    if (!application) return;
    setSaving(true);
    setError(null);

    try {
      await updateDocument("applications", application.id, {
        status: reviewStatus,
        reviewNotes,
        reviewedBy: user?.displayName ?? "Admin",
        updatedAt: serverTimestamp(),
      });
      setApplication({ ...application, status: reviewStatus, reviewNotes });
    } catch {
      setError("Failed to save review.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    if (!application) return;
    setApproving(true);
    setError(null);

    try {
      const result = await callFunction<{ applicationId: string }, ApproveResult>(
        "approveApplication",
        { applicationId: application.id },
      );
      setGeneratedPassword(result.parentPassword);
      setApplication({ ...application, status: "approved" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Approval failed.";
      setError(message);
    } finally {
      setApproving(false);
    }
  }

  function handleCopyPassword() {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error && !application) {
    return (
      <main className="p-8">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        <Link
          href="/dashboard/applications"
          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          &larr; Back to applications
        </Link>
      </main>
    );
  }

  if (!application) return null;

  const canReview = application.status === "pending" || application.status === "under_review";

  return (
    <main className="p-8">
      {/* Password Modal */}
      {generatedPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Accounts Created</h3>
            <p className="mt-2 text-sm text-gray-600">
              The parent and student accounts have been created. The parent&apos;s
              temporary password is shown below.
            </p>
            <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs font-medium text-yellow-800">
                This password will only be shown once
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-md bg-gray-100 px-4 py-3">
              <code className="flex-1 font-mono text-lg font-bold text-gray-900">
                {generatedPassword}
              </code>
              <button
                onClick={handleCopyPassword}
                className="rounded-md bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => setGeneratedPassword(null)}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/applications"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          &larr; Applications
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {application.parentName}
          </h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[application.status]}`}
          >
            {statusLabels[application.status]}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-gray-400">{application.id}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Application Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Parent Details */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Parent / Guardian
            </h2>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">Full Name</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {application.parentName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{application.parentEmail}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{application.parentPhone}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">School</dt>
                <dd className="text-sm text-gray-900">
                  {schoolName || application.schoolId}
                </dd>
              </div>
            </dl>
          </section>

          {/* Children */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Children ({application.children.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      DOB
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Gender
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Previous School
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Class
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {application.children.map((child, i) => (
                    <tr key={i}>
                      <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-900">
                        {child.firstName} {child.lastName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        {child.dateOfBirth}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm capitalize text-gray-500">
                        {child.gender}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        {child.previousSchool || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        {child.classAppliedFor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Timestamps */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Timeline</h2>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">Submitted</dt>
                <dd className="text-sm text-gray-900">
                  {application.createdAt?.seconds
                    ? new Date(application.createdAt.seconds * 1000).toLocaleString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">
                  {application.updatedAt?.seconds
                    ? new Date(application.updatedAt.seconds * 1000).toLocaleString()
                    : "—"}
                </dd>
              </div>
              {application.reviewedBy && (
                <div>
                  <dt className="text-xs text-gray-500">Reviewed By</dt>
                  <dd className="text-sm text-gray-900">{application.reviewedBy}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* Right: Review Panel */}
        <div>
          {canReview ? (
            <section className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Review</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as ApplicationStatus)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="under_review">Under Review</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Review notes..."
                  />
                </div>
                <button
                  onClick={handleSaveReview}
                  disabled={saving}
                  className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Review"}
                </button>
                <div className="border-t pt-4">
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {approving ? "Creating Accounts..." : "Approve & Create Accounts"}
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    This will create Firebase Auth accounts for the parent and all
                    children.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Review</h2>
              <p className="text-sm text-gray-500">
                This application has been{" "}
                <span className="font-medium">{statusLabels[application.status].toLowerCase()}</span>.
              </p>
              {application.reviewNotes && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700">Notes</p>
                  <p className="mt-1 text-sm text-gray-600">{application.reviewNotes}</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
