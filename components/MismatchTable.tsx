"use client";

import { useState } from "react";

interface MismatchRow {
  id: string;
  residentName: string;
  roomNumber: string;
  facilityName: string;
  carePlanLevel: string;
  billingLevel: string;
  monthlyGap: number;
  daysSinceCareChange: number;
  status: string;
}

interface MismatchTableProps {
  mismatches: MismatchRow[];
  onStatusChange: (id: string, status: string) => Promise<void>;
}

function formatLevel(level: string) {
  if (level === "MEMORY_CARE") return "Memory Care";
  return level.replace("_", " ");
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DETECTED: "bg-red-100 text-red-700 ring-red-600/20",
    REVIEWED: "bg-amber-100 text-amber-700 ring-amber-600/20",
    RESOLVED: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    DISMISSED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] || styles.DETECTED
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function MismatchTable({
  mismatches,
  onStatusChange,
}: MismatchTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: string) => {
    setLoadingId(id);
    await onStatusChange(id, status);
    setLoadingId(null);
  };

  if (mismatches.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No mismatches found</h3>
        <p className="mt-1 text-sm text-slate-500">
          All billing records are aligned with current care plans.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900">
          Detected Mismatches
        </h3>
        <p className="text-xs text-slate-500">
          {mismatches.length} record{mismatches.length !== 1 ? "s" : ""} requiring attention
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Resident
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Room
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Facility
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Care Plan
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Billed
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Gap/Mo
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Days
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mismatches.map((m) => {
              const isLoading = loadingId === m.id;
              return (
                <tr
                  key={m.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-slate-900">
                      {m.residentName}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {m.roomNumber}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {m.facilityName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {formatLevel(m.carePlanLevel)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {formatLevel(m.billingLevel)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-red-600">
                      ${Math.abs(m.monthlyGap).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-medium ${
                        m.daysSinceCareChange > 30
                          ? "text-red-600"
                          : m.daysSinceCareChange > 14
                          ? "text-amber-600"
                          : "text-slate-600"
                      }`}
                    >
                      {m.daysSinceCareChange}d
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex gap-1.5">
                      {m.status === "DETECTED" && (
                        <button
                          onClick={() => handleAction(m.id, "REVIEWED")}
                          disabled={isLoading}
                          className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                        >
                          Review
                        </button>
                      )}
                      {(m.status === "DETECTED" ||
                        m.status === "REVIEWED") && (
                        <button
                          onClick={() => handleAction(m.id, "RESOLVED")}
                          disabled={isLoading}
                          className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Resolve
                        </button>
                      )}
                      {m.status !== "DISMISSED" &&
                        m.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleAction(m.id, "DISMISSED")}
                            disabled={isLoading}
                            className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
