"use client";

import { useCallback, useEffect, useState } from "react";
import MealLogForm from "@/components/food-waste/MealLogForm";
import WasteKPIs from "@/components/food-waste/WasteKPIs";
import WasteTrendChart from "@/components/food-waste/WasteTrendChart";
import PredictionPanel from "@/components/food-waste/PredictionPanel";
import FacilityWasteComparison from "@/components/food-waste/FacilityWasteComparison";
import WasteAlerts from "@/components/food-waste/WasteAlerts";
import RecentLogsTable from "@/components/food-waste/RecentLogsTable";

interface Facility {
  id: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PredictionsData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComparisonData = any;

export default function FoodWastePage() {
  const [data, setData] = useState<DashboardData>(null);
  const [predictions, setPredictions] = useState<PredictionsData>(null);
  const [comparison, setComparison] = useState<ComparisonData>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilityFilter, setFacilityFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const params = facilityFilter ? `?facilityId=${facilityFilter}` : "";

    const [dashRes, predRes, compRes] = await Promise.all([
      fetch(`/api/food-waste${params}`),
      fetch(`/api/food-waste?view=predictions${facilityFilter ? `&facilityId=${facilityFilter}` : ""}`),
      fetch(`/api/food-waste?view=comparison`),
    ]);

    const dashData = await dashRes.json();
    const predData = await predRes.json();
    const compData = await compRes.json();

    setData(dashData);
    setPredictions(predData);
    setComparison(compData);
    if (dashData.facilities) setFacilities(dashData.facilities);
    setLoading(false);
  }, [facilityFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Food Waste Tracking</h1>
          <p className="text-sm text-slate-500">
            Monitor meal preparation, reduce waste, and save on food costs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button
            onClick={fetchAll}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      {data && (
        <WasteKPIs
          today={data.today}
          week={data.week}
          month={data.month}
          threshold={data.threshold}
        />
      )}

      {/* Trend chart + alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {data && <WasteTrendChart data={data.trend} threshold={Math.round(data.threshold * 100)} />}
        </div>
        <div>
          {data && <WasteAlerts alerts={data.alerts} threshold={data.threshold} />}
        </div>
      </div>

      {/* Predictions */}
      {predictions && <PredictionPanel predictions={predictions.predictions} />}

      {/* Facility comparison */}
      {comparison && <FacilityWasteComparison comparison={comparison.comparison} />}

      {/* Logging form + recent logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MealLogForm facilities={facilities} onLogged={fetchAll} />
        {data && <RecentLogsTable logs={data.recentLogs} />}
      </div>
    </div>
  );
}
