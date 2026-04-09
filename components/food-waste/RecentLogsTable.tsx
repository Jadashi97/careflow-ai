"use client";

interface MealLog {
  id: string;
  facility: string;
  date: string;
  mealType: string;
  mealsPrepped: number;
  mealsServed: number;
  mealsWasted: number;
  wastePct: number;
  costPerMeal: number;
  loggedBy: string;
}

const MEAL_ICONS: Record<string, string> = {
  BREAKFAST: "🍳",
  LUNCH: "🥗",
  DINNER: "🍽️",
};

export default function RecentLogsTable({ logs }: { logs: MealLog[] }) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Recent Meal Logs</h3>
        <p className="text-xs text-slate-400">Latest entries from kitchen staff</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-3 py-3 text-left font-medium">Meal</th>
              <th className="px-3 py-3 text-left font-medium">Facility</th>
              <th className="px-3 py-3 text-right font-medium">Prepped</th>
              <th className="px-3 py-3 text-right font-medium">Served</th>
              <th className="px-3 py-3 text-right font-medium">Wasted</th>
              <th className="px-3 py-3 text-right font-medium">Waste %</th>
              <th className="px-6 py-3 text-left font-medium">Logged by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">
                  No meal logs yet. Add one above to get started.
                </td>
              </tr>
            ) : (
              logs.map((l) => {
                const isAlert = l.wastePct > 20;
                return (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span>{MEAL_ICONS[l.mealType]}</span>
                        <span className="text-xs text-slate-600">
                          {l.mealType.charAt(0) + l.mealType.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-700">{l.facility}</td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-slate-700">{l.mealsPrepped}</td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-emerald-600">{l.mealsServed}</td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-red-600">{l.mealsWasted}</td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isAlert ? "bg-red-50 text-red-700" : l.wastePct > 12 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {l.wastePct}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{l.loggedBy}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
