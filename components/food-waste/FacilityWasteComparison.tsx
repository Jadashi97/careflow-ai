"use client";

interface ComparisonRow {
  facilityId: string;
  facility: string;
  totalPrepped: number;
  totalServed: number;
  totalWasted: number;
  wastePct: number;
  wastedCost: number;
  byMealType: Array<{ mealType: string; wastePct: number }>;
}

function getWasteColor(pct: number) {
  if (pct >= 20) return "bg-red-500";
  if (pct >= 15) return "bg-amber-500";
  if (pct >= 10) return "bg-yellow-400";
  return "bg-emerald-500";
}

function getWasteText(pct: number) {
  if (pct >= 20) return "text-red-600";
  if (pct >= 15) return "text-amber-600";
  if (pct >= 10) return "text-yellow-600";
  return "text-emerald-600";
}

export default function FacilityWasteComparison({ comparison }: { comparison: ComparisonRow[] }) {
  // Find the best performer for ranking
  const sorted = [...comparison].sort((a, b) => a.wastePct - b.wastePct);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const maxPct = Math.max(...comparison.map((c) => c.wastePct), 1);

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Facility Waste Comparison</h3>
        <p className="text-xs text-slate-400">Last 30 days · waste % and cost by location</p>
      </div>

      <div className="divide-y divide-slate-100">
        {comparison.map((row) => {
          const isBest = row.facilityId === best?.facilityId && comparison.length > 1;
          const isWorst = row.facilityId === worst?.facilityId && comparison.length > 1 && worst.wastePct > best.wastePct;

          return (
            <div key={row.facilityId} className="px-6 py-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{row.facility}</p>
                  {isBest && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                      Best
                    </span>
                  )}
                  {isWorst && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700">
                      Needs Attention
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getWasteText(row.wastePct)}`}>{row.wastePct.toFixed(1)}%</p>
                  <p className="text-xs text-slate-400">${row.wastedCost.toLocaleString()} wasted</p>
                </div>
              </div>

              {/* Visual bar */}
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all ${getWasteColor(row.wastePct)}`}
                  style={{ width: `${Math.min(100, (row.wastePct / maxPct) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {row.byMealType.map((m) => (
                  <div key={m.mealType} className="rounded-md bg-slate-50 px-2 py-1.5 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {m.mealType.slice(0, 1) + m.mealType.slice(1).toLowerCase()}
                    </p>
                    <p className={`text-sm font-semibold ${getWasteText(m.wastePct)}`}>{m.wastePct}%</p>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{row.totalServed.toLocaleString()} served</span>
                <span>{row.totalWasted.toLocaleString()} wasted</span>
                <span>{row.totalPrepped.toLocaleString()} prepared</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
