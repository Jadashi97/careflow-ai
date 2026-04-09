"use client";

import Link from "next/link";

interface Review {
  id: string;
  residentName: string;
  previousLevel: string;
  newLevel: string;
  effectiveDate: string;
  documentedBy: string;
}

interface QuickActionsProps {
  mismatchesToReview: number;
  overdueInvoices: number;
  upcomingReviews: Review[];
  pendingComms: number;
}

const CARE_LABELS: Record<string, string> = {
  LEVEL_1: "L1",
  LEVEL_2: "L2",
  LEVEL_3: "L3",
  LEVEL_4: "L4",
  MEMORY_CARE: "MC",
};

export default function QuickActions({
  mismatchesToReview,
  overdueInvoices,
  upcomingReviews,
  pendingComms,
}: QuickActionsProps) {
  const actionCards = [
    {
      label: "Mismatches to Review",
      count: mismatchesToReview,
      href: "/dashboard/leakage",
      color: "border-red-200 bg-red-50",
      iconColor: "bg-red-500",
      countColor: "text-red-700",
      icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
      urgent: mismatchesToReview > 0,
    },
    {
      label: "Overdue Invoices",
      count: overdueInvoices,
      href: "/dashboard/ar",
      color: "border-amber-200 bg-amber-50",
      iconColor: "bg-amber-500",
      countColor: "text-amber-700",
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      urgent: overdueInvoices > 5,
    },
    {
      label: "Pending Communications",
      count: pendingComms,
      href: "/dashboard/communications",
      color: "border-blue-200 bg-blue-50",
      iconColor: "bg-blue-500",
      countColor: "text-blue-700",
      icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
      urgent: false,
    },
  ];

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
        <p className="text-xs text-slate-400">Items requiring your attention</p>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {actionCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`group relative flex flex-col items-center rounded-lg border p-4 text-center transition-all hover:shadow-md ${card.color}`}
          >
            {card.urgent && (
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
            )}
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${card.iconColor}`}>
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
            <span className={`text-2xl font-bold ${card.countColor}`}>{card.count}</span>
            <span className="mt-0.5 text-xs font-medium text-slate-600">{card.label}</span>
          </Link>
        ))}
      </div>

      {/* Upcoming Care Plan Reviews */}
      <div className="border-t border-slate-100 px-6 py-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Recent Care Plan Changes
        </h4>
        {upcomingReviews.length === 0 ? (
          <p className="text-xs text-slate-400">No recent care plan changes.</p>
        ) : (
          <div className="space-y-2">
            {upcomingReviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-700">{review.residentName}</p>
                  <p className="text-xs text-slate-400">{review.documentedBy}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                    {CARE_LABELS[review.previousLevel] || review.previousLevel}
                  </span>
                  <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
                    {CARE_LABELS[review.newLevel] || review.newLevel}
                  </span>
                  <span className="ml-1 text-xs text-slate-400">
                    {new Date(review.effectiveDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
