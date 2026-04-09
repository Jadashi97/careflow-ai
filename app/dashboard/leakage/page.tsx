"use client";

import { useCallback, useEffect, useState } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { FacilityBarChart, LeakageTrendChart } from "@/components/LeakageCharts";
import LeakageFilters from "@/components/LeakageFilters";
import MismatchTable from "@/components/MismatchTable";

interface MismatchDetail {
  id: string;
  residentName: string;
  roomNumber: string;
  facilityId: string;
  facilityName: string;
  carePlanLevel: string;
  billingLevel: string;
  monthlyGap: number;
  daysSinceCareChange: number;
  status: string;
}

interface Stats {
  totalMonthlyLeakage: number;
  totalAnnualProjectedLeakage: number;
  affectedResidents: number;
  totalMismatchedRecords: number;
  averageDaysSinceCareChange: number;
}

interface FacilityData {
  name: string;
  amount: number;
  count: number;
}

interface TrendData {
  month: string;
  leakage: number;
}

interface FilterState {
  facilityId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: FilterState = {
  facilityId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export default function LeakageDashboard() {
  const [loading, setLoading] = useState(true);
  const [mismatches, setMismatches] = useState<MismatchDetail[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMonthlyLeakage: 0,
    totalAnnualProjectedLeakage: 0,
    affectedResidents: 0,
    totalMismatchedRecords: 0,
    averageDaysSinceCareChange: 0,
  });
  const [byFacility, setByFacility] = useState<FacilityData[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async (f: FilterState) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.facilityId) params.set("facilityId", f.facilityId);
    if (f.status) params.set("status", f.status);
    if (f.dateFrom) params.set("dateFrom", f.dateFrom);
    if (f.dateTo) params.set("dateTo", f.dateTo);

    const res = await fetch(`/api/leakage?${params.toString()}`);
    const data = await res.json();
    setMismatches(data.mismatches || []);
    setStats((s) => data.stats || s);
    setByFacility(data.byFacility || []);
    setTrend(data.trend || []);
    setFacilities(data.facilities || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/leakage/mismatches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData(filters);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/leakage/export");
      const data = await res.json();

      // Generate PDF client-side
      const { generateLeakagePDF } = await import("@/lib/generate-pdf");
      const blob = await generateLeakagePDF(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CareFlow_Revenue_Leakage_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
    setExporting(false);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Revenue Leakage Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Care plan vs. billing discrepancy analysis
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {exporting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Report
            </>
          )}
        </button>
      </div>

      {/* Hero Stats Banner */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">
              Revenue Leakage Alert
            </p>
            <p className="text-xs text-slate-500">
              Based on care plan vs. billing analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {/* Total Monthly Leakage */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Monthly Leakage
            </p>
            <AnimatedCounter
              value={stats.totalMonthlyLeakage}
              prefix="$"
              className="text-4xl font-bold text-red-400"
              duration={2000}
            />
            <p className="mt-1 text-xs text-red-400/70">active gap</p>
          </div>

          {/* Projected Annual */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Projected Annual
            </p>
            <AnimatedCounter
              value={stats.totalAnnualProjectedLeakage}
              prefix="$"
              className="text-4xl font-bold text-amber-400"
              duration={2000}
            />
            <p className="mt-1 text-xs text-amber-400/70">if unresolved</p>
          </div>

          {/* Affected Residents */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Affected Residents
            </p>
            <AnimatedCounter
              value={stats.affectedResidents}
              className="text-4xl font-bold text-white"
              duration={1500}
            />
            <p className="mt-1 text-xs text-slate-500">
              of {stats.totalMismatchedRecords} records
            </p>
          </div>

          {/* Average Lag */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Avg. Lag Days
            </p>
            <AnimatedCounter
              value={stats.averageDaysSinceCareChange}
              className="text-4xl font-bold text-white"
              duration={1500}
            />
            <p className="mt-1 text-xs text-slate-500">
              between care change & billing
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <LeakageFilters
          filters={filters}
          facilities={facilities}
          onChange={setFilters}
          onReset={() => setFilters(defaultFilters)}
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FacilityBarChart data={byFacility} />
        <LeakageTrendChart data={trend} />
      </div>

      {/* Mismatch Table */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <span className="ml-3 text-sm text-slate-500">Loading data...</span>
        </div>
      ) : (
        <MismatchTable
          mismatches={mismatches}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
