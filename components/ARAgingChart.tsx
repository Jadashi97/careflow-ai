"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AgingData {
  current: { amount: number; count: number };
  days30: { amount: number; count: number };
  days60: { amount: number; count: number };
  days90: { amount: number; count: number };
  days120: { amount: number; count: number };
}

const BUCKET_LABELS: Record<string, string> = {
  current: "Current",
  days30: "1–30 Days",
  days60: "31–60 Days",
  days90: "61–90 Days",
  days120: "120+ Days",
};

const BUCKET_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444", "#991b1b"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-slate-700">{label}</p>
      <p className="text-sm font-bold" style={{ color: payload[0]?.payload?.color }}>
        ${payload[0]?.value?.toLocaleString()}
      </p>
      <p className="text-xs text-slate-500">
        {payload[0]?.payload?.count} invoice{payload[0]?.payload?.count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function ARAgingChart({ data }: { data: AgingData }) {
  const chartData = Object.entries(data).map(([key, val], i) => ({
    name: BUCKET_LABELS[key],
    amount: val.amount,
    count: val.count,
    color: BUCKET_COLORS[i],
  }));

  const totalOutstanding = chartData.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">AR Aging Summary</h3>
            <p className="text-xs text-slate-500">Outstanding receivables by age bucket</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total Outstanding</p>
            <p className="text-xl font-bold text-slate-900">
              ${totalOutstanding.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Row */}
        <div className="mb-6 grid grid-cols-5 gap-3">
          {chartData.map((bucket) => (
            <div key={bucket.name} className="rounded-lg bg-slate-50 p-3 text-center">
              <div
                className="mx-auto mb-2 h-1.5 w-8 rounded-full"
                style={{ backgroundColor: bucket.color }}
              />
              <p className="text-xs text-slate-500">{bucket.name}</p>
              <p className="text-sm font-bold text-slate-900">
                ${bucket.amount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">{bucket.count} inv.</p>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={52}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
