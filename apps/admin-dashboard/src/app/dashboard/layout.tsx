"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@loretto/shared-ui";
import { useAuthContext } from "@loretto/firebase-config";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Applications", href: "/dashboard/applications" },
];

function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuthContext();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-white">
      <div className="border-b px-4 py-4">
        <h1 className="text-sm font-bold text-gray-900">Loretto Admin</h1>
        <p className="truncate text-xs text-gray-500">{user?.displayName}</p>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-2 py-3">
        <button
          onClick={signOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["super_admin", "admin"]}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </AuthGuard>
  );
}
