"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthContext, queryDocuments } from "@loretto/firebase-config";
import type { Application } from "@loretto/shared-types";

export default function DashboardPage() {
  const { user, claims } = useAuthContext();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const apps = await queryDocuments<Application>("applications");
        setStats({
          total: apps.length,
          pending: apps.filter((a) => a.status === "pending").length,
          approved: apps.filter((a) => a.status === "approved").length,
          rejected: apps.filter((a) => a.status === "rejected").length,
        });
      } catch {
        // Stats are non-critical; silently fail
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: "Total Applications", value: stats.total, color: "bg-gray-100 text-gray-900" },
    { label: "Pending Review", value: stats.pending, color: "bg-yellow-50 text-yellow-800" },
    { label: "Approved", value: stats.approved, color: "bg-green-50 text-green-800" },
    { label: "Rejected", value: stats.rejected, color: "bg-red-50 text-red-800" },
  ];

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome, {user?.displayName ?? "Admin"} &middot; {claims?.role}
          {claims?.adminSubRole ? ` (${claims.adminSubRole})` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-lg p-5 ${card.color}`}>
            <p className="text-sm font-medium opacity-75">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/dashboard/applications"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all applications &rarr;
        </Link>
      </div>
    </main>
  );
}
