"use client";

import { useState } from "react";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  isDefault: boolean;
}

interface EmailTemplateBuilderProps {
  templates: EmailTemplate[];
  onSave: (template: {
    id?: string;
    name: string;
    subject: string;
    body: string;
    type: string;
  }) => void;
  onDelete: (id: string) => void;
}

const TEMPLATE_TYPES = [
  { value: "PAYMENT_REMINDER", label: "Payment Reminder", icon: "💳" },
  { value: "OVERDUE_NOTICE", label: "Overdue Notice", icon: "⚠️" },
  { value: "PAYMENT_PLAN_OFFER", label: "Payment Plan Offer", icon: "📋" },
  { value: "RATE_ADJUSTMENT", label: "Rate Adjustment", icon: "📊" },
  { value: "CUSTOM", label: "Custom", icon: "✏️" },
];

const MERGE_FIELDS = [
  { tag: "{{resident_name}}", label: "Resident Name" },
  { tag: "{{contact_name}}", label: "Contact Name" },
  { tag: "{{amount_due}}", label: "Amount Due" },
  { tag: "{{facility_name}}", label: "Facility Name" },
  { tag: "{{due_date}}", label: "Due Date" },
  { tag: "{{care_level}}", label: "Care Level" },
  { tag: "{{room_number}}", label: "Room Number" },
  { tag: "{{portal_link}}", label: "Portal Link" },
];

const PRE_BUILT_TEMPLATES = {
  PAYMENT_REMINDER: {
    name: "Payment Reminder",
    subject: "Payment Reminder for {{resident_name}}'s Care",
    body: `Dear {{contact_name}},

This is a friendly reminder that a payment of {{amount_due}} for {{resident_name}}'s care at {{facility_name}} is due on {{due_date}}.

You can view the full billing details and make a payment through our family portal:
{{portal_link}}

If you have already sent your payment, please disregard this notice. For questions about billing, please contact our billing department.

Thank you for your continued trust in our care.

Warm regards,
{{facility_name}} Billing Team`,
  },
  OVERDUE_NOTICE: {
    name: "Overdue Notice",
    subject: "Important: Overdue Balance for {{resident_name}}",
    body: `Dear {{contact_name}},

We are writing to inform you that the payment of {{amount_due}} for {{resident_name}}'s care at {{facility_name}} is now past due. The original due date was {{due_date}}.

We understand that circumstances may arise, and we are here to help. Please contact us at your earliest convenience to discuss payment options.

View your account details: {{portal_link}}

If payment has already been sent, please disregard this notice.

Sincerely,
{{facility_name}} Billing Department`,
  },
  PAYMENT_PLAN_OFFER: {
    name: "Payment Plan Offer",
    subject: "Payment Plan Options for {{resident_name}}'s Account",
    body: `Dear {{contact_name}},

We understand that managing care expenses can be challenging. We'd like to offer flexible payment plan options for {{resident_name}}'s outstanding balance of {{amount_due}} at {{facility_name}}.

Our available payment plans include:
- Monthly installments over 3 months
- Bi-weekly payments over 6 weeks
- Custom arrangements based on your needs

To discuss these options or set up a payment plan, please contact our billing department or visit: {{portal_link}}

We're committed to working with families to ensure continued quality care.

Best regards,
{{facility_name}} Billing Team`,
  },
  RATE_ADJUSTMENT: {
    name: "Rate Adjustment Notification",
    subject: "Care Rate Update for {{resident_name}}",
    body: `Dear {{contact_name}},

We are writing to inform you of an upcoming adjustment to {{resident_name}}'s care rate at {{facility_name}}.

Based on the most recent care assessment, {{resident_name}}'s care level has been updated. The new monthly rate will be {{amount_due}}, effective {{due_date}}.

This change reflects the current level of care being provided to ensure {{resident_name}}'s comfort and well-being. Room: {{room_number}}, Care Level: {{care_level}}.

For a detailed breakdown, please visit: {{portal_link}}

If you have questions about this adjustment, please don't hesitate to reach out.

Respectfully,
{{facility_name}} Care Team`,
  },
};

export default function EmailTemplateBuilder({
  templates,
  onSave,
  onDelete,
}: EmailTemplateBuilderProps) {
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
    type: "PAYMENT_REMINDER",
  });
  const [previewMode, setPreviewMode] = useState(false);

  const startNew = (type?: string) => {
    if (type && type in PRE_BUILT_TEMPLATES) {
      const tmpl = PRE_BUILT_TEMPLATES[type as keyof typeof PRE_BUILT_TEMPLATES];
      setForm({ name: tmpl.name, subject: tmpl.subject, body: tmpl.body, type });
    } else {
      setForm({ name: "", subject: "", body: "", type: type || "CUSTOM" });
    }
    setEditing(null);
    setShowEditor(true);
    setPreviewMode(false);
  };

  const startEdit = (template: EmailTemplate) => {
    setForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
    });
    setEditing(template);
    setShowEditor(true);
    setPreviewMode(false);
  };

  const handleSave = () => {
    onSave({ id: editing?.id, ...form });
    setShowEditor(false);
    setEditing(null);
  };

  const insertMergeField = (tag: string) => {
    setForm((prev) => ({ ...prev, body: prev.body + tag }));
  };

  // Preview with sample data
  const previewText = (text: string) =>
    text
      .replace(/\{\{resident_name\}\}/g, "Margaret Anderson")
      .replace(/\{\{contact_name\}\}/g, "Michael Anderson")
      .replace(/\{\{amount_due\}\}/g, "$5,500")
      .replace(/\{\{facility_name\}\}/g, "Sunrise Gardens")
      .replace(/\{\{due_date\}\}/g, "April 15, 2026")
      .replace(/\{\{care_level\}\}/g, "Level 2")
      .replace(/\{\{room_number\}\}/g, "205")
      .replace(/\{\{portal_link\}\}/g, "https://careflow.app/family/abc123");

  return (
    <div>
      {/* Template Editor */}
      {showEditor ? (
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-slate-900">
              {editing ? "Edit Template" : "Create Template"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  previewMode
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {previewMode ? "Edit" : "Preview"}
              </button>
              <button
                onClick={() => { setShowEditor(false); setEditing(null); }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.subject || !form.body}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                Save Template
              </button>
            </div>
          </div>

          {previewMode ? (
            /* Preview Mode */
            <div className="p-6">
              <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 border-b border-slate-200 pb-4">
                  <p className="text-xs text-slate-400">From: billing@sunrisecare.com</p>
                  <p className="text-xs text-slate-400">To: michael.anderson@email.com</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {previewText(form.subject)}
                  </p>
                </div>
                <div className="whitespace-pre-wrap text-sm text-slate-700">
                  {previewText(form.body)}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Template Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. 7-Day Payment Reminder"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {TEMPLATE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-slate-500">Subject Line</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Payment Reminder for {{resident_name}}"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Merge Fields */}
              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-slate-500">Merge Fields (click to insert)</label>
                <div className="flex flex-wrap gap-1.5">
                  {MERGE_FIELDS.map((f) => (
                    <button
                      key={f.tag}
                      onClick={() => insertMergeField(f.tag)}
                      className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      {f.tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-slate-500">Email Body</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={12}
                  placeholder="Write your email template here. Use merge fields like {{resident_name}} for personalization..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Pre-built Templates */}
          <div className="mb-6 rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">Quick Start Templates</h3>
              <p className="text-xs text-slate-500">Start with a pre-built template and customize it</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 lg:grid-cols-4">
              {TEMPLATE_TYPES.filter((t) => t.value !== "CUSTOM").map((t) => (
                <button
                  key={t.value}
                  onClick={() => startNew(t.value)}
                  className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-4 text-center transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-medium text-slate-700">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Templates */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Saved Templates</h3>
                <p className="text-xs text-slate-500">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => startNew()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                + New Template
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {templates.map((t) => {
                const typeInfo = TEMPLATE_TYPES.find((tt) => tt.value === t.type);
                return (
                  <div key={t.id} className="flex items-center gap-4 px-6 py-4">
                    <span className="text-xl">{typeInfo?.icon || "✏️"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{t.name}</p>
                        {t.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{t.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
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
              {templates.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-slate-400">
                  No templates yet. Use a quick start template above or create a custom one.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
