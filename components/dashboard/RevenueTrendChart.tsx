"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueTrendChartProps {
  data: Array<Record<string, unknown>>;
  facilityNames: string[];
}

const FACILITY_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-slate-500">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-slate-600">{entry.name}</span>
          </div>
          <span className="text-xs font-semibold text-slate-900">
            ${Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
      {payload.length > 1 && (
        <div className="mt-1.5 border-t border-slate-100 pt-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total</span>
            <span className="text-xs font-bold text-slate-900">
              ${payload.reduce((s: number, e: { value: number }) => s + (e.value || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RevenueTrendChart({ data, facilityNames }: RevenueTrendChartProps) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Revenue Trend</h3>
        <p className="text-xs text-slate-400">12-month revenue by facility</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              {facilityNames.map((name, i) => (
                <linearGradient key={name} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={FACILITY_COLORS[i % FACILITY_COLORS.length]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={FACILITY_COLORS[i % FACILITY_COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              iconType="circle"
              iconSize={8}
            />
            {facilityNames.map((name, i) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                name={name}
                stroke={FACILITY_COLORS[i % FACILITY_COLORS.length]}
                strokeWidth={2}
                fill={`url(#gradient-${i})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
