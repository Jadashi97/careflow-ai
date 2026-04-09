"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface FamilyData {
  resident: {
    name: string;
    facility: string;
    facilityAddress: string;
    roomNumber: string;
    careLevel: string;
    monthlyRate: number;
  };
  currentBalance: number;
  paymentHistory: Array<{
    id: string;
    month: string;
    amountBilled: number;
    amountPaid: number;
    paidDate: string | null;
    status: string;
  }>;
  upcomingCharges: Array<{
    id: string;
    month: string;
    amount: number;
    dueDate: string;
  }>;
  tokenExpiresAt: string;
}

const CARE_LEVEL_LABELS: Record<string, string> = {
  LEVEL_1: "Level 1 - Basic",
  LEVEL_2: "Level 2 - Moderate",
  LEVEL_3: "Level 3 - Enhanced",
  LEVEL_4: "Level 4 - Comprehensive",
  MEMORY_CARE: "Memory Care",
};

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
  PENDING: "bg-blue-100 text-blue-700",
};

export default function FamilyPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    fetch(`/api/family?token=${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid or expired link");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
          <p className="mt-1 text-sm text-slate-500">{error || "This link is invalid or has expired."}</p>
          <p className="mt-4 text-xs text-slate-400">
            Please contact the facility for a new portal link.
          </p>
        </div>
      </div>
    );
  }

  const { resident, currentBalance, paymentHistory, upcomingCharges } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Pay Now Modal (Simulated) */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Make a Payment</h3>
            <p className="mt-1 text-sm text-slate-500">This is a simulated payment portal.</p>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-500">Payment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-slate-400">$</span>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder={currentBalance.toFixed(2)}
                  className="w-full rounded-lg border border-slate-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 p-3">
              <p className="text-xs text-amber-700">
                <strong>Demo Mode:</strong> This is a prototype. No actual payment will be processed.
                In production, this would integrate with a payment gateway (Stripe, Square, etc.).
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPayModal(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPayModal(false);
                  // In production: process payment
                  alert(`Payment of $${payAmount || currentBalance.toFixed(2)} would be processed here.`);
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-blue-600">CareFlow</span>
              <span className="ml-1 text-xs text-slate-400">Family Portal</span>
            </div>
            <p className="text-xs text-slate-400">
              Link expires: {new Date(data.tokenExpiresAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Resident Info */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{resident.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{resident.facility}</p>
              <p className="text-xs text-slate-400">{resident.facilityAddress}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Room {resident.roomNumber}
                </span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                  {CARE_LEVEL_LABELS[resident.careLevel] || resident.careLevel}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  ${resident.monthlyRate.toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance + Pay Now */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current Balance</p>
            <p className={`mt-2 text-3xl font-bold ${currentBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            {currentBalance > 0 && (
              <p className="mt-1 text-xs text-slate-500">Amount due for outstanding invoices</p>
            )}
            {currentBalance <= 0 && (
              <p className="mt-1 text-xs text-emerald-600">All payments are up to date!</p>
            )}
          </div>
          <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-sm">
            <button
              onClick={() => {
                setPayAmount(currentBalance > 0 ? currentBalance.toFixed(2) : "");
                setShowPayModal(true);
              }}
              className="flex flex-col items-center gap-2 text-white transition-transform hover:scale-105"
            >
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              <span className="text-lg font-semibold">Pay Now</span>
              <span className="text-xs text-blue-200">Secure Payment</span>
            </button>
          </div>
        </div>

        {/* Upcoming Charges */}
        <div className="mb-8 rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Upcoming Charges</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingCharges.map((charge) => (
              <div key={charge.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(charge.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xs text-slate-500">
                    Due: {new Date(charge.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ${charge.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            {upcomingCharges.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-400">No upcoming charges.</div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Month</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Billed</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Paid</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Date Paid</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {new Date(p.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      ${p.amountBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      ${p.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {p.paidDate
                        ? new Date(p.paidDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[p.status] || ""}`}>
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {paymentHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">
                      No payment history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Questions about your bill? Contact the billing department at (512) 555-0100
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Powered by CareFlow AI &middot; Secure Family Portal
          </p>
        </div>
      </main>
    </div>
  );
}
