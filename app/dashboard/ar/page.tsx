"use client";

import { useCallback, useEffect, useState } from "react";
import ARAgingChart from "@/components/ARAgingChart";
import ARInvoiceTable, { Invoice } from "@/components/ARInvoiceTable";
import ReminderRulesPanel from "@/components/ReminderRulesPanel";
import CommunicationLogModal from "@/components/CommunicationLogModal";

interface AgingData {
  current: { amount: number; count: number };
  days30: { amount: number; count: number };
  days60: { amount: number; count: number };
  days90: { amount: number; count: number };
  days120: { amount: number; count: number };
}

interface ReminderRule {
  id: string;
  name: string;
  daysOverdue: number;
  channel: string;
  action: string;
  messageTemplate: string | null;
  isActive: boolean;
}

type Tab = "invoices" | "rules";

export default function ARPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [aging, setAging] = useState<AgingData>({
    current: { amount: 0, count: 0 },
    days30: { amount: 0, count: 0 },
    days60: { amount: 0, count: 0 },
    days90: { amount: 0, count: 0 },
    days120: { amount: 0, count: 0 },
  });
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("invoices");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Communication log modal
  const [commModal, setCommModal] = useState<{
    residentId: string;
    residentName: string;
  } | null>(null);

  const fetchAR = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/ar");
    const data = await res.json();
    setInvoices(data.invoices || []);
    setAging(data.aging);
    setTotalOutstanding(data.totalOutstanding || 0);
    setLoading(false);
  }, []);

  const fetchRules = useCallback(async () => {
    const res = await fetch("/api/ar/rules");
    const data = await res.json();
    setRules(data.rules || []);
  }, []);

  useEffect(() => {
    fetchAR();
    fetchRules();
  }, [fetchAR, fetchRules]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map((i) => i.id)));
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: "remind" | "escalate" | "mark_paid") => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);

    const res = await fetch("/api/ar/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
    });
    const data = await res.json();

    showToast(data.message || "Action completed");
    setSelectedIds(new Set());
    setBulkLoading(false);
    fetchAR();
  };

  // Reminder rule handlers
  const handleToggleRule = async (id: string, isActive: boolean) => {
    await fetch("/api/ar/rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    fetchRules();
  };

  const handleAddRule = async (rule: {
    name: string;
    daysOverdue: number;
    channel: string;
    action: string;
    messageTemplate: string;
  }) => {
    await fetch("/api/ar/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    fetchRules();
    showToast("Reminder rule created");
  };

  const handleDeleteRule = async (id: string) => {
    await fetch("/api/ar/rules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchRules();
    showToast("Rule deleted");
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 animate-pulse rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Communication Log Modal */}
      {commModal && (
        <CommunicationLogModal
          residentId={commModal.residentId}
          residentName={commModal.residentName}
          onClose={() => setCommModal(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Accounts Receivable</h1>
        <p className="text-sm text-slate-500">
          Manage outstanding invoices, aging, and automated reminders
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">${totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Open Invoices</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{invoices.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Overdue (&gt;30d)</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            ${(aging.days60.amount + aging.days90.amount + aging.days120.amount).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Active Rules</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {rules.filter((r) => r.isActive).length}
          </p>
        </div>
      </div>

      {/* Aging Chart */}
      <div className="mb-8">
        <ARAgingChart data={aging} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "invoices"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Outstanding Invoices
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "rules"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Reminder Rules
          </button>
        </div>

        {/* Bulk Actions — only show on invoices tab when items selected */}
        {activeTab === "invoices" && selectedIds.size > 0 && (
          <div className="flex items-center gap-2 pb-3">
            <span className="text-xs text-slate-500">
              {selectedIds.size} selected:
            </span>
            <button
              onClick={() => handleBulkAction("remind")}
              disabled={bulkLoading}
              className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
            >
              Send Reminder
            </button>
            <button
              onClick={() => handleBulkAction("escalate")}
              disabled={bulkLoading}
              className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
            >
              Escalate
            </button>
            <button
              onClick={() => handleBulkAction("mark_paid")}
              disabled={bulkLoading}
              className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
            >
              Mark as Paid
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <span className="ml-3 text-sm text-slate-500">Loading...</span>
        </div>
      ) : activeTab === "invoices" ? (
        <ARInvoiceTable
          invoices={invoices}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          onViewComms={(id, name) => setCommModal({ residentId: id, residentName: name })}
        />
      ) : (
        <ReminderRulesPanel
          rules={rules}
          onToggleRule={handleToggleRule}
          onAddRule={handleAddRule}
          onDeleteRule={handleDeleteRule}
        />
      )}
    </div>
  );
}
