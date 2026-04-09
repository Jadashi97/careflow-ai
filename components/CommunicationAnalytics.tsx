"use client";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalyticsData {
  summary: {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    responseRate: number;
    clickRate: number;
    avgTimeToPayment: number;
    medianTimeToPayment: number;
  };
  channelBreakdown: Array<{
    channel: string;
    sent: number;
    opened: number;
    responded: number;
  }>;
  weeklyTrend: Array<{
    week: string;
    sent: number;
    opened: number;
    responded: number;
    payments: number;
  }>;
  paymentTimeline: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

interface CommunicationAnalyticsProps {
  data: AnalyticsData | null;
  loading: boolean;
}

const CHANNEL_LABELS: Record<string, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  PHONE: "Phone",
  LETTER: "Letter",
};

export default function CommunicationAnalytics({ data, loading }: CommunicationAnalyticsProps) {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <span className="ml-3 text-sm text-slate-500">Loading analytics...</span>
      </div>
    );
  }

  const { summary, channelBreakdown, weeklyTrend, paymentTimeline } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Sent</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.totalSent}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Open Rate</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{summary.openRate}%</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${summary.openRate}%` }} />
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Response Rate</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{summary.responseRate}%</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${summary.responseRate}%` }} />
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Avg. Time to Payment</p>
          <p className="mt-1 text-2xl font-bold text-violet-600">{summary.avgTimeToPayment} days</p>
          <p className="mt-1 text-xs text-slate-400">Median: {summary.medianTimeToPayment} days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Trend */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Communication Trend (8 Weeks)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area type="monotone" dataKey="sent" name="Sent" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              <Area type="monotone" dataKey="opened" name="Opened" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
              <Area type="monotone" dataKey="payments" name="Payments" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time to Payment Distribution */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Time to Payment After Reminder</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={paymentTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" name="Payments" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Performance by Channel</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {channelBreakdown.map((ch) => {
            const openRate = ch.sent > 0 ? Math.round((ch.opened / ch.sent) * 100) : 0;
            const responseRate = ch.sent > 0 ? Math.round((ch.responded / ch.sent) * 100) : 0;
            return (
              <div key={ch.channel} className="rounded-lg border border-slate-100 p-4">
                <p className="text-sm font-medium text-slate-900">
                  {CHANNEL_LABELS[ch.channel] || ch.channel}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Sent</span>
                    <span className="font-medium text-slate-900">{ch.sent}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Open Rate</span>
                    <span className="font-medium text-blue-600">{openRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Response Rate</span>
                    <span className="font-medium text-emerald-600">{responseRate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
