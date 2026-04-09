"use client";

import { useEffect, useState } from "react";

interface CommLog {
  id: string;
  channel: string;
  action: string;
  subject: string;
  message: string;
  status: string;
  sentAt: string;
  respondedAt: string | null;
  response: string | null;
  billingRecord: {
    billingMonth: string;
    amountBilled: string;
  } | null;
}

interface CommunicationLogModalProps {
  residentId: string;
  residentName: string;
  onClose: () => void;
}

const CHANNEL_ICONS: Record<string, string> = {
  EMAIL: "📧",
  SMS: "📱",
  PHONE: "📞",
  LETTER: "✉️",
};

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  RESPONDED: "bg-violet-100 text-violet-700",
};

export default function CommunicationLogModal({
  residentId,
  residentName,
  onClose,
}: CommunicationLogModalProps) {
  const [logs, setLogs] = useState<CommLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ar/communications?residentId=${residentId}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setLoading(false);
      });
  }, [residentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Communication History
            </h3>
            <p className="text-sm text-slate-500">{residentName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <span className="ml-2 text-sm text-slate-500">Loading...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No communication history for this resident.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CHANNEL_ICONS[log.channel] || "📧"}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{log.subject}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(log.sentAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[log.status] || STATUS_STYLES.SENT
                      }`}
                    >
                      {log.status.charAt(0) + log.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{log.message}</p>
                  {log.billingRecord && (
                    <p className="mt-2 text-xs text-slate-400">
                      Invoice: {new Date(log.billingRecord.billingMonth).toLocaleDateString("en-US", { month: "short", year: "numeric" })} &middot; $
                      {Number(log.billingRecord.amountBilled).toLocaleString()}
                    </p>
                  )}
                  {log.response && (
                    <div className="mt-2 rounded-md bg-violet-50 p-2">
                      <p className="text-xs font-medium text-violet-700">Response:</p>
                      <p className="text-xs text-violet-600">{log.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
