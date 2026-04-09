"use client";

import { useState } from "react";

interface ScheduledReport {
  id: string;
  reportType: string;
  reportLabel: string;
  frequency: "weekly" | "monthly";
  email: string;
  nextDelivery: string;
  isActive: boolean;
}

const REPORT_LABELS: Record<string, string> = {
  revenue_leakage: "Revenue Leakage Summary",
  ar_aging: "AR Aging Report",
  occupancy_revenue: "Occupancy & Revenue Report",
  monthly_financial: "Monthly Financial Summary",
  care_level_distribution: "Care Level Distribution",
};

export default function ScheduledReports() {
  const [schedules, setSchedules] = useState<ScheduledReport[]>([
    {
      id: "1",
      reportType: "monthly_financial",
      reportLabel: "Monthly Financial Summary",
      frequency: "monthly",
      email: "admin@sunrisecare.com",
      nextDelivery: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      isActive: true,
    },
    {
      id: "2",
      reportType: "ar_aging",
      reportLabel: "AR Aging Report",
      frequency: "weekly",
      email: "billing@sunrisecare.com",
      nextDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
      isActive: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    reportType: "revenue_leakage",
    frequency: "weekly" as "weekly" | "monthly",
    email: "",
  });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    if (!form.email) return;
    const now = new Date();
    const nextDelivery = form.frequency === "weekly"
      ? new Date(now.getTime() + 7 * 86400000)
      : new Date(now.getFullYear(), now.getMonth() + 1, 1);

    setSchedules((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        reportType: form.reportType,
        reportLabel: REPORT_LABELS[form.reportType] || form.reportType,
        frequency: form.frequency,
        email: form.email,
        nextDelivery: nextDelivery.toISOString(),
        isActive: true,
      },
    ]);
    setForm({ reportType: "revenue_leakage", frequency: "weekly", email: "" });
    setShowForm(false);
    showToast("Report schedule created (simulated)");
  };

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    showToast("Schedule removed");
  };

  return (
    <div className="rounded-xl bg-white shadow-sm">
      {toast && (
        <div className="fixed right-6 top-6 z-50 animate-pulse rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Scheduled Reports</h3>
          <p className="text-xs text-slate-400">Automatic email delivery of reports</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Schedule"}
        </button>
      </div>

      {showForm && (
        <div className="border-b border-slate-100 bg-slate-50 p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Report</label>
              <select
                value={form.reportType}
                onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(REPORT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as "weekly" | "monthly" })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Deliver To</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={!form.email}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              Save Schedule
            </button>
            <span className="text-xs text-slate-400">Reports are simulated for this prototype</span>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-50">
        {schedules.map((s) => (
          <div key={s.id} className={`flex items-center gap-4 px-6 py-4 ${!s.isActive ? "opacity-50" : ""}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{s.reportLabel}</p>
              <p className="text-xs text-slate-500">
                {s.frequency === "weekly" ? "Every Monday" : "1st of each month"} &middot; {s.email}
              </p>
              <p className="text-xs text-slate-400">
                Next: {new Date(s.nextDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleSchedule(s.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  s.isActive ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.isActive ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <button
                onClick={() => deleteSchedule(s.id)}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            No scheduled reports. Click &ldquo;+ New Schedule&rdquo; to set up automatic delivery.
          </div>
        )}
      </div>
    </div>
  );
}
