"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import KPICards from "@/components/dashboard/KPICards";
import FacilityComparisonTable from "@/components/dashboard/FacilityComparisonTable";
import RevenueTrendChart from "@/components/dashboard/RevenueTrendChart";
import OccupancyGauges from "@/components/dashboard/OccupancyGauges";
import CashFlowForecast from "@/components/dashboard/CashFlowForecast";
import QuickActions from "@/components/dashboard/QuickActions";
import DashboardFilters from "@/components/dashboard/DashboardFilters";

interface Filters {
  facilityId: string;
  dateFrom: string;
  dateTo: string;
}

interface DashboardData {
  kpis: {
    totalRevenueThisMonth: number;
    totalBilledThisMonth: number;
    totalRevenueLastMonth: number;
    revenueChange: number;
    totalAROutstanding: number;
    occupancyRate: number;
    totalBeds: number;
    totalOccupied: number;
    leakageDetected: number;
    mismatchCount: number;
    netOperatingIncome: number;
  };
  facilityComparison: Array<{
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
  }>;
  revenueTrend: Array<Record<string, unknown>>;
  cashFlowForecast: Array<{
    month: string;
    projectedIncome: number;
    projectedCollections: number;
    projectedExpenses: number;
    netCashFlow: number;
  }>;
  quickActions: {
    mismatchesToReview: number;
    overdueInvoices: number;
    upcomingReviews: Array<{
      id: string;
      residentName: string;
      previousLevel: string;
      newLevel: string;
      effectiveDate: string;
      documentedBy: string;
    }>;
    pendingComms: number;
  };
  facilities: Array<{ id: string; name: string }>;
}

export default function OverviewPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    facilityId: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchData = useCallback(async (f: Filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.facilityId) params.set("facilityId", f.facilityId);
    if (f.dateFrom) params.set("dateFrom", f.dateFrom);
    if (f.dateTo) params.set("dateTo", f.dateTo);

    const res = await fetch(`/api/dashboard?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  // Get current date for header
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const facilityNames = data?.facilityComparison.map((f) => f.name) || [];

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            {dateLabel} &middot; Welcome back, {session?.user?.name}
          </p>
        </div>
        <DashboardFilters
          facilities={data?.facilities || []}
          filters={filters}
          onChange={handleFilterChange}
        />
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center rounded-xl bg-white p-20 shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <KPICards data={data.kpis} />

          {/* Facility Comparison Table */}
          <FacilityComparisonTable data={data.facilityComparison} />

          {/* Charts Row: Revenue Trend + Occupancy Gauges */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RevenueTrendChart
                data={data.revenueTrend}
                facilityNames={facilityNames}
              />
            </div>
            <div>
              <OccupancyGauges data={data.facilityComparison} />
            </div>
          </div>

          {/* Bottom Row: Cash Flow Forecast + Quick Actions */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CashFlowForecast data={data.cashFlowForecast} />
            <QuickActions
              mismatchesToReview={data.quickActions.mismatchesToReview}
              overdueInvoices={data.quickActions.overdueInvoices}
              upcomingReviews={data.quickActions.upcomingReviews}
              pendingComms={data.quickActions.pendingComms}
            />
          </div>
        </div>
      )}
    </div>
  );
}
