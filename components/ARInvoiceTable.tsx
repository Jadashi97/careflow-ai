"use client";


export interface Invoice {
  id: string;
  residentId: string;
  residentName: string;
  facilityName: string;
  amountDue: number;
  amountBilled: number;
  dueDate: string;
  daysOverdue: number;
  paymentType: string;
  paymentStatus: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  lastCommunication: string | null;
}

interface ARInvoiceTableProps {
  invoices: Invoice[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onViewComms: (residentId: string, residentName: string) => void;
}

function formatPaymentType(type: string) {
  return type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function AgingBadge({ days }: { days: number }) {
  if (days <= 0)
    return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Current</span>;
  if (days <= 30)
    return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">{days}d</span>;
  if (days <= 60)
    return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">{days}d</span>;
  if (days <= 90)
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{days}d</span>;
  return <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-900">{days}d</span>;
}

export default function ARInvoiceTable({
  invoices,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onViewComms,
}: ARInvoiceTableProps) {
  const allSelected = invoices.length > 0 && selectedIds.size === invoices.length;

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
        <p className="mt-1 text-sm text-slate-500">No outstanding invoices.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900">Outstanding Invoices</h3>
        <p className="text-xs text-slate-500">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} &middot;{" "}
          {selectedIds.size > 0 && (
            <span className="font-medium text-blue-600">
              {selectedIds.size} selected
            </span>
          )}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Resident</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Facility</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Amount Due</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Due Date</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Overdue</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Pay Type</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Contact</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Last Comm.</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoices.map((inv) => (
              <tr key={inv.id} className={`transition-colors hover:bg-slate-50/50 ${selectedIds.has(inv.id) ? "bg-blue-50/30" : ""}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(inv.id)}
                    onChange={() => onToggleSelect(inv.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{inv.residentName}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{inv.facilityName}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-900">
                    ${inv.amountDue.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <AgingBadge days={inv.daysOverdue} />
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {formatPaymentType(inv.paymentType)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-slate-700">{inv.contactName || "—"}</p>
                  <p className="text-xs text-slate-400">{inv.contactPhone || ""}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {inv.lastCommunication
                    ? new Date(inv.lastCommunication).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewComms(inv.residentId, inv.residentName)}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
