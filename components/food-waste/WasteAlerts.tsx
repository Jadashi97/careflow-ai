"use client";

interface Alert {
  id: string;
  facility: string;
  date: string;
  mealType: string;
  mealsPrepped: number;
  mealsWasted: number;
  wastePct: number;
  wastedCost: number;
}

const MEAL_ICONS: Record<string, string> = {
  BREAKFAST: "🍳",
  LUNCH: "🥗",
  DINNER: "🍽️",
};

export default function WasteAlerts({ alerts, threshold }: { alerts: Alert[]; threshold: number }) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Waste Alerts</h3>
            <p className="text-xs text-slate-400">Meals exceeding {Math.round(threshold * 100)}% waste in the last 7 days</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            {alerts.length} active
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">All meals under threshold</p>
          <p className="text-xs text-slate-400">No waste alerts in the past 7 days</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-6 py-3">
              <span className="text-xl">{MEAL_ICONS[a.mealType]}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{a.facility}</p>
                <p className="text-xs text-slate-400">
                  {a.mealType.charAt(0) + a.mealType.slice(1).toLowerCase()} ·{" "}
                  {new Date(a.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">{a.wastePct}%</p>
                <p className="text-xs text-slate-400">
                  {a.mealsWasted}/{a.mealsPrepped} · ${a.wastedCost}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
