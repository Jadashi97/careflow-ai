"use client";

interface FacilityOccupancy {
  id: string;
  name: string;
  totalBeds: number;
  currentOccupancy: number;
  occupancyPct: number;
}

function GaugeRing({ pct, size = 120 }: { pct: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 95 ? "#ef4444" : pct >= 85 ? "#f59e0b" : pct >= 60 ? "#3b82f6" : "#10b981";

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={10}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export default function OccupancyGauges({ data }: { data: FacilityOccupancy[] }) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Occupancy by Facility</h3>
        <p className="text-xs text-slate-400">Current bed utilization</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6 p-6">
        {data.map((f) => {
          const statusLabel =
            f.occupancyPct >= 95
              ? "At Capacity"
              : f.occupancyPct >= 85
              ? "High"
              : f.occupancyPct >= 60
              ? "Moderate"
              : "Low";

          const statusColor =
            f.occupancyPct >= 95
              ? "text-red-600"
              : f.occupancyPct >= 85
              ? "text-amber-600"
              : f.occupancyPct >= 60
              ? "text-blue-600"
              : "text-emerald-600";

          return (
            <div key={f.id} className="flex flex-col items-center">
              <div className="relative">
                <GaugeRing pct={f.occupancyPct} size={110} />
                {/* Centered text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">{f.occupancyPct}%</span>
                  <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700">{f.name}</p>
              <p className="text-xs text-slate-400">
                {f.currentOccupancy}/{f.totalBeds} beds
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
