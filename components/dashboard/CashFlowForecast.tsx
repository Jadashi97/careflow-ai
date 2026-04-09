"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface ForecastData {
  month: string;
  projectedIncome: number;
  projectedCollections: number;
  projectedExpenses: number;
  netCashFlow: number;
}

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
    </div>
  );
}

export default function CashFlowForecast({ data }: { data: ForecastData[] }) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Cash Flow Forecast</h3>
          <p className="text-xs text-slate-400">Projected income vs. expenses (next 3 months)</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
          Forecast
        </span>
      </div>

      <div className="p-6">
        {/* Summary cards above chart */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {data.map((d) => (
            <div key={d.month} className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs font-medium text-slate-500">{d.month}</p>
              <p className={`mt-1 text-lg font-bold ${d.netCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                ${d.netCashFlow.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Net Cash Flow</p>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={2} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
            <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
            <Bar
              dataKey="projectedCollections"
              name="Projected Collections"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="projectedExpenses"
              name="Projected Expenses"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
