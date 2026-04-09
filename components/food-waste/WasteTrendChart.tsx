"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface TrendDay {
  date: string;
  prepped: number;
  served: number;
  wasted: number;
  wastePct: number;
  cost: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TrendDay;
  const dateLabel = new Date(d.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-slate-500">{dateLabel}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-slate-500">Prepped</span>
          <span className="text-xs font-semibold text-slate-900">{d.prepped}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-slate-500">Served</span>
          <span className="text-xs font-semibold text-emerald-600">{d.served}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-slate-500">Wasted</span>
          <span className="text-xs font-semibold text-red-600">{d.wasted}</span>
        </div>
        <div className="border-t border-slate-100 pt-1">
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-medium text-slate-600">Waste %</span>
            <span className="text-xs font-bold text-slate-900">{d.wastePct}%</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-medium text-slate-600">Cost</span>
            <span className="text-xs font-bold text-slate-900">${d.cost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WasteTrendChart({ data, threshold = 20 }: { data: TrendDay[]; threshold?: number }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">14-Day Waste Trend</h3>
          <p className="text-xs text-slate-400">Daily meals prepped, served, and waste %</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span className="text-xs text-slate-500">Served</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-red-400" />
            <span className="text-xs text-slate-500">Wasted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-3 bg-blue-600" />
            <span className="text-xs text-slate-500">Waste %</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={formatted} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, "dataMax + 5"]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Legend wrapperStyle={{ display: "none" }} />
            <ReferenceLine
              yAxisId="right"
              y={threshold}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: `${threshold}% threshold`, position: "insideTopRight", fill: "#ef4444", fontSize: 10 }}
            />
            <Bar yAxisId="left" dataKey="served" stackId="meals" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar yAxisId="left" dataKey="wasted" stackId="meals" fill="#f87171" radius={[4, 4, 0, 0]} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="wastePct"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3, fill: "#2563eb" }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
