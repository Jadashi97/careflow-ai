"use client";

interface Facility {
  id: string;
  name: string;
}

interface Filters {
  facilityId: string;
  dateFrom: string;
  dateTo: string;
}

interface DashboardFiltersProps {
  facilities: Facility[];
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function DashboardFilters({
  facilities,
  filters,
  onChange,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Facility filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-400">Facility</label>
        <select
          value={filters.facilityId}
          onChange={(e) => onChange({ ...filters, facilityId: e.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Facilities</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-400">From</label>
        <input
          type="month"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-400">To</label>
        <input
          type="month"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Reset */}
      {(filters.facilityId || filters.dateFrom || filters.dateTo) && (
        <button
          onClick={() => onChange({ facilityId: "", dateFrom: "", dateTo: "" })}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
        >
          Reset
        </button>
      )}
    </div>
  );
}
