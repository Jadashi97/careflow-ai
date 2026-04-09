"use client";

import { useState } from "react";

interface CustomReportBuilderProps {
  onGenerate: (metrics: string[]) => void;
  loading: boolean;
}

const AVAILABLE_METRICS = [
  { key: "occupancy", label: "Occupancy Data", description: "Beds, occupancy rates by facility", icon: "🏥" },
  { key: "revenue", label: "Revenue Summary", description: "Billed, collected, and outstanding amounts", icon: "💰" },
  { key: "leakage", label: "Revenue Leakage", description: "Mismatches and monthly gap amounts", icon: "🔍" },
  { key: "ar_aging", label: "AR Aging", description: "Outstanding invoices and aging buckets", icon: "📋" },
  { key: "care_levels", label: "Care Level Distribution", description: "Resident count by care level", icon: "👥" },
  { key: "communications", label: "Communication Stats", description: "Total sent and pending communications", icon: "✉️" },
];

export default function CustomReportBuilder({ onGenerate, loading }: CustomReportBuilderProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === AVAILABLE_METRICS.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(AVAILABLE_METRICS.map((m) => m.key)));
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Custom Report Builder</h3>
          <p className="text-xs text-slate-400">Select metrics to include in your report</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
          >
            {selected.size === AVAILABLE_METRICS.length ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={() => onGenerate(Array.from(selected))}
            disabled={selected.size === 0 || loading}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-6 lg:grid-cols-3">
        {AVAILABLE_METRICS.map((metric) => {
          const isSelected = selected.has(metric.key);
          return (
            <button
              key={metric.key}
              onClick={() => toggle(metric.key)}
              className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-lg ${isSelected ? "bg-blue-100" : "bg-slate-100"}`}>
                {metric.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                    {metric.label}
                  </p>
                  {isSelected && (
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{metric.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="border-t border-slate-100 px-6 py-3">
          <p className="text-xs text-slate-500">
            <span className="font-medium text-blue-600">{selected.size}</span> metric{selected.size !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </div>
  );
}
