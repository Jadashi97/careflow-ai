"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ExtendedUser } from "@/lib/types";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Facilities", href: "/dashboard/facilities", icon: "🏥" },
  { label: "Residents", href: "/dashboard/residents", icon: "👥" },
  { label: "Billing", href: "/dashboard/billing", icon: "💰" },
  { label: "Leakage", href: "/dashboard/leakage", icon: "🔍" },
  { label: "AR Tracker", href: "/dashboard/ar", icon: "📋" },
  { label: "Communications", href: "/dashboard/communications", icon: "✉️" },
  { label: "Upload", href: "/dashboard/upload", icon: "📤" },
  { label: "Reports", href: "/dashboard/reports", icon: "📊" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as ExtendedUser | undefined;

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-6">
        <span className="text-2xl font-bold text-blue-400">CareFlow</span>
        <span className="text-xs font-medium text-slate-400">AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.role}</p>
          <p className="text-xs text-slate-500">{user?.organizationName}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
