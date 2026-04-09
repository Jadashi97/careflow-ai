"use client";

import { useState } from "react";

interface Schedule {
  id: string;
  scheduledAt: string;
  status: string;
  channel: string;
  subject: string;
  message: string;
  sentAt: string | null;
  resident: {
    firstName: string;
    lastName: string;
    contactName: string | null;
    contactEmail: string | null;
  };
  template: { name: string; type: string } | null;
  rule: { name: string } | null;
}

interface CommunicationSchedulerProps {
  schedules: Schedule[];
  onAutoQueue: () => void;
  onSend: (id: string) => void;
  onCancel: (id: string) => void;
  loading: boolean;
}

const CHANNEL_ICONS: Record<string, string> = {
  EMAIL: "📧",
  SMS: "📱",
  PHONE: "📞",
  LETTER: "✉️",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SENT: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default function CommunicationScheduler({
  schedules,
  onAutoQueue,
  onSend,
  onCancel,
  loading,
}: CommunicationSchedulerProps) {
  const [filter, setFilter] = useState<"all" | "PENDING" | "SENT" | "CANCELLED">("all");

  const filtered = filter === "all" ? schedules : schedules.filter((s) => s.status === filter);
  const pendingCount = schedules.filter((s) => s.status === "PENDING").length;

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Communication Queue</h3>
          <p className="text-xs text-slate-500">
            {pendingCount} pending &middot; {schedules.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAutoQueue}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Queuing..." : "Auto-Queue from Rules"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-slate-100 px-6 py-3">
        {(["all", "PENDING", "SENT", "CANCELLED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-blue-100 text-blue-700"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="divide-y divide-slate-50">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-start gap-4 px-6 py-4">
            <span className="mt-0.5 text-lg">{CHANNEL_ICONS[s.channel] || "📧"}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900">
                  {s.resident.firstName} {s.resident.lastName}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[s.status] || ""}`}>
                  {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="text-xs text-slate-700">{s.subject}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {s.rule && <span>Rule: {s.rule.name} &middot; </span>}
                {s.template && <span>Template: {s.template.name} &middot; </span>}
                Scheduled: {new Date(s.scheduledAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                })}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                To: {s.resident.contactName || "N/A"} ({s.resident.contactEmail || "no email"})
              </p>
            </div>

            {s.status === "PENDING" && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSend(s.id)}
                  className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  Send Now
                </button>
                <button
                  onClick={() => onCancel(s.id)}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            )}
            {s.status === "SENT" && s.sentAt && (
              <span className="text-xs text-emerald-600">
                Sent {new Date(s.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            {filter === "all"
              ? 'No scheduled communications. Click "Auto-Queue from Rules" to generate based on AR rules.'
              : `No ${filter.toLowerCase()} communications.`}
          </div>
        )}
      </div>
    </div>
  );
}
