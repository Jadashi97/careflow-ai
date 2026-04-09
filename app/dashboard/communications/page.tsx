"use client";

import { useCallback, useEffect, useState } from "react";
import EmailTemplateBuilder, { EmailTemplate } from "@/components/EmailTemplateBuilder";
import CommunicationScheduler from "@/components/CommunicationScheduler";
import CommunicationAnalytics from "@/components/CommunicationAnalytics";

type Tab = "templates" | "scheduler" | "analytics";

interface ScheduleItem {
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

interface AnalyticsData {
  summary: {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    responseRate: number;
    clickRate: number;
    avgTimeToPayment: number;
    medianTimeToPayment: number;
  };
  channelBreakdown: Array<{
    channel: string;
    sent: number;
    opened: number;
    responded: number;
  }>;
  weeklyTrend: Array<{
    week: string;
    sent: number;
    opened: number;
    responded: number;
    payments: number;
  }>;
  paymentTimeline: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTemplates = useCallback(async () => {
    const res = await fetch("/api/communications/templates");
    const data = await res.json();
    setTemplates(data.templates || []);
    setLoading(false);
  }, []);

  const fetchSchedules = useCallback(async () => {
    const res = await fetch("/api/communications/schedule");
    const data = await res.json();
    setSchedules(data.schedules || []);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const res = await fetch("/api/communications/analytics");
    const data = await res.json();
    setAnalytics(data);
    setAnalyticsLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchSchedules();
    fetchAnalytics();
  }, [fetchTemplates, fetchSchedules, fetchAnalytics]);

  // Template handlers
  const handleSaveTemplate = async (template: {
    id?: string;
    name: string;
    subject: string;
    body: string;
    type: string;
  }) => {
    if (template.id) {
      await fetch("/api/communications/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      showToast("Template updated");
    } else {
      await fetch("/api/communications/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      showToast("Template created");
    }
    fetchTemplates();
  };

  const handleDeleteTemplate = async (id: string) => {
    await fetch("/api/communications/templates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchTemplates();
    showToast("Template deleted");
  };

  // Schedule handlers
  const handleAutoQueue = async () => {
    setScheduleLoading(true);
    const res = await fetch("/api/communications/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "auto" }),
    });
    const data = await res.json();
    showToast(data.message || "Communications queued");
    fetchSchedules();
    setScheduleLoading(false);
  };

  const handleSend = async (id: string) => {
    await fetch("/api/communications/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "send" }),
    });
    fetchSchedules();
    fetchAnalytics();
    showToast("Communication sent");
  };

  const handleCancel = async (id: string) => {
    await fetch("/api/communications/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    fetchSchedules();
    showToast("Communication cancelled");
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 animate-pulse rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Family Communications</h1>
        <p className="text-sm text-slate-500">
          Manage email templates, schedule communications, and track engagement
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-slate-200">
        {([
          { key: "templates", label: "Email Templates" },
          { key: "scheduler", label: "Scheduler" },
          { key: "analytics", label: "Analytics" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading && activeTab === "templates" ? (
        <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <span className="ml-3 text-sm text-slate-500">Loading...</span>
        </div>
      ) : activeTab === "templates" ? (
        <EmailTemplateBuilder
          templates={templates}
          onSave={handleSaveTemplate}
          onDelete={handleDeleteTemplate}
        />
      ) : activeTab === "scheduler" ? (
        <CommunicationScheduler
          schedules={schedules}
          onAutoQueue={handleAutoQueue}
          onSend={handleSend}
          onCancel={handleCancel}
          loading={scheduleLoading}
        />
      ) : (
        <CommunicationAnalytics data={analytics} loading={analyticsLoading} />
      )}
    </div>
  );
}
