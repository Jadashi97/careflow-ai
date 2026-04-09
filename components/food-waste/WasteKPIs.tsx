"use client";

import AnimatedCounter from "@/components/AnimatedCounter";

interface PeriodMetrics {
  prepped: number;
  wasted: number;
  wastePct: number;
  wastedCost: number;
}

interface WasteKPIsProps {
  today: PeriodMetrics;
  week: PeriodMetrics;
  month: PeriodMetrics;
  threshold: number;
}

function WasteBadge({ pct, threshold }: { pct: number; threshold: number }) {
  const overThreshold = pct > threshold * 100;
  const moderate = pct > 12;
  const color = overThreshold
    ? "bg-red-50 text-red-700"
    : moderate
    ? "bg-amber-50 text-amber-700"
    : "bg-emerald-50 text-emerald-700";
  const label = overThreshold ? "High" : moderate ? "Moderate" : "Healthy";
  return (
    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

export default function WasteKPIs({ today, week, month, threshold }: WasteKPIsProps) {
  const cards = [
    {
      label: "Today's Waste %",
      value: today.wastePct,
      suffix: "%",
      sublabel: `${today.wasted} of ${today.prepped} meals`,
      color: "from-blue-500 to-blue-600",
      icon: "🍽️",
      pct: today.wastePct,
    },
    {
      label: "Today's Waste Cost",
      value: today.wastedCost,
      prefix: "$",
      sublabel: `${today.wasted} meals discarded`,
      color: "from-amber-500 to-orange-500",
      icon: "💸",
    },
    {
      label: "7-Day Waste Cost",
      value: week.wastedCost,
      prefix: "$",
      sublabel: `${week.wastePct.toFixed(1)}% avg waste rate`,
      color: "from-violet-500 to-purple-600",
      icon: "📅",
      pct: week.wastePct,
    },
    {
      label: "Month-to-Date Cost",
      value: month.wastedCost,
      prefix: "$",
      sublabel: `${month.wasted} meals · ${month.wastePct.toFixed(1)}% avg`,
      color: "from-rose-500 to-red-600",
      icon: "📊",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${card.color}`} />
          <div className="mb-3 flex items-center justify-between">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} text-lg`}>
              {card.icon}
            </div>
            {card.pct !== undefined && <WasteBadge pct={card.pct} threshold={threshold} />}
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{card.label}</p>
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
