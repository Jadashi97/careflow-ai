"use client";

interface Facility {
  id: string;
  name: string;
}

interface FilterState {
  facilityId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface LeakageFiltersProps {
  filters: FilterState;
  facilities: Facility[];
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function LeakageFilters({
  filters,
  facilities,
  onChange,
  onReset,
}: LeakageFiltersProps) {
  const hasFilters =
    filters.facilityId || filters.status || filters.dateFrom || filters.dateTo;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Facility */}
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Facility
          </label>
          <select
            value={filters.facilityId}
            onChange={(e) =>
              onChange({ ...filters, facilityId: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="min-w-[160px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        {/* Date From */}
        <div className="min-w-[150px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              onChange({ ...filters, dateFrom: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Date To */}
        <div className="min-w-[150px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={onReset}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
