"use client";

import { useState } from "react";

interface ReminderRule {
  id: string;
  name: string;
  daysOverdue: number;
  channel: string;
  action: string;
  messageTemplate: string | null;
  isActive: boolean;
}

interface ReminderRulesPanelProps {
  rules: ReminderRule[];
  onToggleRule: (id: string, isActive: boolean) => void;
  onAddRule: (rule: {
    name: string;
    daysOverdue: number;
    channel: string;
    action: string;
    messageTemplate: string;
  }) => void;
  onDeleteRule: (id: string) => void;
}

const CHANNEL_ICONS: Record<string, string> = {
  EMAIL: "📧",
  SMS: "📱",
  PHONE: "📞",
  LETTER: "✉️",
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  SEND_REMINDER: { label: "Reminder", color: "bg-blue-100 text-blue-700" },
  ESCALATE: { label: "Escalate", color: "bg-amber-100 text-amber-700" },
  COLLECTIONS: { label: "Collections", color: "bg-red-100 text-red-700" },
};

export default function ReminderRulesPanel({
  rules,
  onToggleRule,
  onAddRule,
  onDeleteRule,
}: ReminderRulesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    daysOverdue: 7,
    channel: "EMAIL",
    action: "SEND_REMINDER",
    messageTemplate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRule(form);
    setForm({ name: "", daysOverdue: 7, channel: "EMAIL", action: "SEND_REMINDER", messageTemplate: "" });
    setShowForm(false);
  };

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Automated Reminder Rules</h3>
          <p className="text-xs text-slate-500">Configure when and how to contact about overdue payments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Rule"}
        </button>
      </div>

      {/* Add Rule Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border-b border-slate-100 bg-slate-50 p-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Rule Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. 7-Day Email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Days Overdue</label>
              <input
                type="number"
                required
                min={1}
                value={form.daysOverdue}
                onChange={(e) => setForm({ ...form, daysOverdue: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Channel</label>
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="PHONE">Phone</option>
                <option value="LETTER">Letter</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Action</label>
              <select
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="SEND_REMINDER">Send Reminder</option>
                <option value="ESCALATE">Escalate</option>
                <option value="COLLECTIONS">Send to Collections</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-slate-500">Message Template (optional)</label>
            <textarea
              value={form.messageTemplate}
              onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
              placeholder="Use {contact_name}, {resident_name}, {amount}, {due_date}, {facility_name} as placeholders..."
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Save Rule
          </button>
        </form>
      )}

      {/* Rules List */}
      <div className="divide-y divide-slate-50">
        {rules.map((rule) => {
          const actionInfo = ACTION_LABELS[rule.action] || ACTION_LABELS.SEND_REMINDER;
          return (
            <div
              key={rule.id}
              className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                !rule.isActive ? "opacity-50" : ""
              }`}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <span className="text-lg">{CHANNEL_ICONS[rule.channel] || "📧"}</span>
              </div>

              {/* Rule details */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{rule.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionInfo.color}`}>
                    {actionInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Triggers at <span className="font-medium">{rule.daysOverdue} days</span> overdue via{" "}
                  <span className="font-medium">{rule.channel.toLowerCase()}</span>
                </p>
                {rule.messageTemplate && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400 italic">
                    &ldquo;{rule.messageTemplate}&rdquo;
                  </p>
                )}
              </div>

              {/* Toggle + Delete */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleRule(rule.id, !rule.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    rule.isActive ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      rule.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
        {rules.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            No reminder rules configured. Click &ldquo;+ Add Rule&rdquo; to create one.
          </div>
        )}
      </div>
    </div>
  );
}
