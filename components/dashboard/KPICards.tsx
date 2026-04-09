"use client";

import AnimatedCounter from "@/components/AnimatedCounter";

interface KPIs {
  totalRevenueThisMonth: number;
  totalBilledThisMonth: number;
  revenueChange: number;
  totalAROutstanding: number;
  occupancyRate: number;
  totalBeds: number;
  totalOccupied: number;
  leakageDetected: number;
  mismatchCount: number;
  netOperatingIncome: number;
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isUp = value > 0;
  return (
    <span
      className={`ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
      }`}
    >
      <svg
        className={`h-3 w-3 ${isUp ? "" : "rotate-180"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

export default function KPICards({ data }: { data: KPIs }) {
  const cards = [
    {
      label: "Total Revenue",
      sublabel: "This month (billed)",
      value: data.totalRevenueThisMonth,
      prefix: "$",
      color: "from-blue-500 to-blue-600",
      iconPath: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      trend: data.revenueChange,
    },
    {
      label: "AR Outstanding",
      sublabel: "Total unpaid balance",
      value: data.totalAROutstanding,
      prefix: "$",
      color: "from-amber-500 to-orange-500",
      iconPath: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    },
    {
      label: "Occupancy Rate",
      sublabel: `${data.totalOccupied} of ${data.totalBeds} beds`,
      value: data.occupancyRate,
      suffix: "%",
      color: "from-violet-500 to-purple-600",
      iconPath: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
    },
    {
      label: "Revenue Leakage",
      sublabel: `${data.mismatchCount} mismatches detected`,
      value: data.leakageDetected,
      prefix: "$",
      color: "from-red-500 to-rose-600",
      iconPath: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    },
    {
      label: "Net Operating Income",
      sublabel: "Revenue minus est. expenses",
      value: data.netOperatingIncome,
      prefix: "$",
      color: "from-emerald-500 to-teal-600",
      iconPath: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          {/* Gradient accent bar */}
          <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${card.color}`} />

          <div className="mb-3 flex items-center justify-between">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color}`}>
              <svg className="h-4.5 w-4.5 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={card.iconPath} />
              </svg>
            </div>
            {card.trend !== undefined && <TrendBadge value={card.trend} />}
          </div>

          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {card.label}
          </p>
          <div className="mt-1">
            <AnimatedCounter
              value={card.value}
              prefix={card.prefix || ""}
              suffix={card.suffix || ""}
              className="text-2xl font-bold text-slate-900"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">{card.sublabel}</p>
        </div>
      ))}
    </div>
  );
}
