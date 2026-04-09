"use client";

interface FacilityData {
  id: string;
  name: string;
  totalBeds: number;
  currentOccupancy: number;
  occupancyPct: number;
  revenue: number;
  revenueLastMonth: number;
  revenueTrend: number;
  arTotal: number;
  arCurrent: number;
  ar30: number;
  ar60: number;
  ar90Plus: number;
  leakage: number;
  mismatchCount: number;
}

function TrendArrow({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-xs text-slate-400">-</span>;
  }
  const isUp = value > 0;
  return (
    <div className={`flex items-center gap-1 ${isUp ? "text-emerald-600" : "text-red-500"}`}>
      <svg
        className={`h-3.5 w-3.5 ${isUp ? "" : "rotate-180"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
      <span className="text-xs font-semibold">{Math.abs(value)}%</span>
    </div>
  );
}

function OccupancyBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : pct >= 50 ? "bg-blue-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700">{pct}%</span>
    </div>
  );
}

function ARMiniBar({ current, d30, d60, d90 }: { current: number; d30: number; d60: number; d90: number }) {
  const total = current + d30 + d60 + d90;
  if (total === 0) return <span className="text-xs text-slate-400">$0</span>;

  const pcts = {
    current: (current / total) * 100,
    d30: (d30 / total) * 100,
    d60: (d60 / total) * 100,
    d90: (d90 / total) * 100,
  };

  return (
    <div>
      <span className="text-xs font-semibold text-slate-700">${total.toLocaleString()}</span>
      <div className="mt-1 flex h-1.5 w-20 overflow-hidden rounded-full">
        <div className="bg-emerald-400" style={{ width: `${pcts.current}%` }} />
        <div className="bg-amber-400" style={{ width: `${pcts.d30}%` }} />
        <div className="bg-orange-400" style={{ width: `${pcts.d60}%` }} />
        <div className="bg-red-500" style={{ width: `${pcts.d90}%` }} />
      </div>
    </div>
  );
}

export default function FacilityComparisonTable({ data }: { data: FacilityData[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
        No facility data available.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Facility Comparison</h3>
        <p className="text-xs text-slate-400">Side-by-side performance metrics</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">Facility</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">Occupancy</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">Revenue</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">MoM Trend</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">AR Aging</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">Leakage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((f) => (
              <tr key={f.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.currentOccupancy}/{f.totalBeds} beds</p>
                </td>
                <td className="px-4 py-4">
                  <OccupancyBar pct={f.occupancyPct} />
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-slate-900">
                    ${f.revenue.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <TrendArrow value={f.revenueTrend} />
                </td>
                <td className="px-4 py-4">
                  <ARMiniBar current={f.arCurrent} d30={f.ar30} d60={f.ar60} d90={f.ar90Plus} />
                </td>
                <td className="px-4 py-4">
                  {f.leakage > 0 ? (
                    <div>
                      <span className="text-xs font-semibold text-red-600">
                        ${f.leakage.toLocaleString()}/mo
                      </span>
                      <p className="text-xs text-slate-400">
                        {f.mismatchCount} mismatch{f.mismatchCount !== 1 ? "es" : ""}
                      </p>
                    </div>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                      Clean
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 border-t border-slate-100 px-6 py-3">
        <span className="text-xs text-slate-400">AR Aging:</span>
        <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-xs text-slate-500">Current</span></div>
        <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-400" /><span className="text-xs text-slate-500">1-30d</span></div>
        <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-orange-400" /><span className="text-xs text-slate-500">31-60d</span></div>
        <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-500" /><span className="text-xs text-slate-500">90d+</span></div>
      </div>
    </div>
  );
}
