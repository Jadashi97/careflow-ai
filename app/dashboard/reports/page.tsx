"use client";

import { useCallback, useEffect, useState } from "react";
import ReportPreview from "@/components/reports/ReportPreview";
import ScheduledReports from "@/components/reports/ScheduledReports";
import CustomReportBuilder from "@/components/reports/CustomReportBuilder";
import { generateCSV, downloadCSV, downloadBlob, REPORT_COLUMNS } from "@/lib/reports/generate-csv";
import { generateReportPDF } from "@/lib/reports/generate-report-pdf";

type Tab = "reports" | "scheduled" | "custom";

interface Facility {
  id: string;
  name: string;
}

const REPORT_TEMPLATES = [
  {
    key: "revenue_leakage",
    label: "Revenue Leakage Summary",
    description: "Mismatches between care levels and billing, with gap analysis",
    icon: "🔍",
    color: "border-red-200 bg-red-50",
  },
  {
    key: "ar_aging",
    label: "AR Aging Report",
    description: "Outstanding receivables broken down by aging buckets",
    icon: "📋",
    color: "border-amber-200 bg-amber-50",
  },
  {
    key: "occupancy_revenue",
    label: "Occupancy & Revenue Report",
    description: "Facility occupancy rates with revenue and collection metrics",
    icon: "🏥",
    color: "border-blue-200 bg-blue-50",
  },
  {
    key: "monthly_financial",
    label: "Monthly Financial Summary",
    description: "12-month financial overview with billing, collections, and net income",
    icon: "📊",
    color: "border-emerald-200 bg-emerald-50",
  },
  {
    key: "care_level_distribution",
    label: "Care Level Distribution",
    description: "Resident distribution across care levels with transition history",
    icon: "👥",
    color: "border-violet-200 bg-violet-50",
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reports");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filters, setFilters] = useState({
    facilityId: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchReport = useCallback(async (type: string, f?: typeof filters) => {
    setLoading(true);
    const params = new URLSearchParams({ type });
    const currentFilters = f || filters;
    if (currentFilters.facilityId) params.set("facilityId", currentFilters.facilityId);
    if (currentFilters.dateFrom) params.set("dateFrom", currentFilters.dateFrom);
    if (currentFilters.dateTo) params.set("dateTo", currentFilters.dateTo);

    const res = await fetch(`/api/reports?${params.toString()}`);
    const data = await res.json();
    setReportData(data);
    if (data.facilities) setFacilities(data.facilities);
    setLoading(false);
  }, [filters]);

  const handleSelectReport = (key: string) => {
    setSelectedReport(key);
    fetchReport(key);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    if (selectedReport) {
      fetchReport(selectedReport, newFilters);
    }
  };

  const handleExportCSV = () => {
    if (!reportData?.rows) return;
    const columns = REPORT_COLUMNS[reportData.reportType] || [];
    if (columns.length === 0) return;
    const csv = generateCSV(reportData.rows, columns);
    const filename = `${reportData.reportType}_${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleExportPDF = async () => {
    if (!reportData) return;
    setExporting(true);
    try {
      const blob = await generateReportPDF(reportData);
      const filename = `${reportData.reportType}_${new Date().toISOString().split("T")[0]}.pdf`;
      downloadBlob(blob, filename);
    } catch {
      // PDF generation may fail in some environments
      alert("PDF export encountered an issue. Try CSV export instead.");
    }
    setExporting(false);
  };

  const handleCustomGenerate = async (metrics: string[]) => {
    setLoading(true);
    setSelectedReport("custom");
    const params = new URLSearchParams({ type: "custom", metrics: metrics.join(",") });
    if (filters.facilityId) params.set("facilityId", filters.facilityId);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);

    const res = await fetch(`/api/reports?${params.toString()}`);
    const data = await res.json();
    setReportData(data);
    if (data.facilities) setFacilities(data.facilities);
    setLoading(false);
    setActiveTab("reports");
  };

  // Load facilities on mount
  useEffect(() => {
    fetch("/api/reports?type=occupancy_revenue")
      .then((r) => r.json())
      .then((d) => { if (d.facilities) setFacilities(d.facilities); });
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">Generate, preview, and export financial reports</p>
        </div>

        {/* Filters — always visible */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.facilityId}
            onChange={(e) => handleFilterChange({ ...filters, facilityId: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400">From</label>
            <input
              type="month"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange({ ...filters, dateFrom: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400">To</label>
            <input
              type="month"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange({ ...filters, dateTo: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {(filters.facilityId || filters.dateFrom || filters.dateTo) && (
            <button
              onClick={() => handleFilterChange({ facilityId: "", dateFrom: "", dateTo: "" })}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-slate-200">
        {([
          { key: "reports" as const, label: "Report Templates" },
          { key: "scheduled" as const, label: "Scheduled Delivery" },
          { key: "custom" as const, label: "Custom Builder" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "scheduled" ? (
        <ScheduledReports />
      ) : activeTab === "custom" ? (
        <div className="space-y-6">
          <CustomReportBuilder onGenerate={handleCustomGenerate} loading={loading} />
          {reportData?.reportType === "custom" && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Custom Report Results</h3>
                <button
                  onClick={handleExportCSV}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
                >
                  Export CSV
                </button>
              </div>
              <ReportPreview data={reportData} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Report template cards (only show when no report selected) */}
          {!selectedReport && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {REPORT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.key}
                  onClick={() => handleSelectReport(tmpl.key)}
                  className={`flex items-start gap-3 rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${tmpl.color}`}
                >
                  <span className="text-2xl">{tmpl.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{tmpl.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{tmpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Report Preview */}
          {selectedReport && (
            <div>
              {/* Report header bar */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setSelectedReport(null); setReportData(null); }}
                    className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                  </button>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {reportData?.title || "Loading..."}
                    </h3>
                    {reportData?.generatedAt && (
                      <p className="text-xs text-slate-400">
                        Generated {new Date(reportData.generatedAt).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Export buttons */}
                {reportData && (
                  <div className="flex items-center gap-2">
                    {/* Re-run other reports */}
                    <div className="mr-2 flex gap-1">
                      {REPORT_TEMPLATES.filter((t) => t.key !== selectedReport).slice(0, 3).map((t) => (
                        <button
                          key={t.key}
                          onClick={() => handleSelectReport(t.key)}
                          className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          title={t.label}
                        >
                          {t.icon}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleExportCSV}
                      disabled={!reportData.rows}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      CSV
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={exporting}
                      className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {exporting ? "Generating..." : "PDF"}
                    </button>
                  </div>
                )}
              </div>

              {/* Report content */}
              {loading ? (
                <div className="flex items-center justify-center rounded-xl bg-white p-16 shadow-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                  <span className="ml-3 text-sm text-slate-500">Generating report...</span>
                </div>
              ) : (
                <div className="rounded-xl bg-white p-6 shadow-sm print:shadow-none">
                  {/* Print header (hidden on screen) */}
                  <div className="mb-6 hidden border-b-2 border-blue-600 pb-4 print:block">
                    <p className="text-xl font-bold text-blue-600">CareFlow AI</p>
                    <p className="text-sm text-slate-500">Senior Care Management Platform</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{reportData?.title}</p>
                    <p className="text-xs text-slate-400">
                      Generated: {reportData?.generatedAt && new Date(reportData.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <ReportPreview data={reportData} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
