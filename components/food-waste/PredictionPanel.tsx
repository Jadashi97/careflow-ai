"use client";

interface MealPrediction {
  mealType: string;
  recommendedPrep: number;
  expectedDiners: number;
  historicalAvgPrepped: number;
  historicalWastePct: number;
  potentialSavings: number;
}

interface FacilityPrediction {
  facilityId: string;
  facility: string;
  currentOccupancy: number;
  totalBeds: number;
  dayOfWeek: string;
  predictionDate: string;
  meals: MealPrediction[];
}

const MEAL_ICONS: Record<string, string> = {
  BREAKFAST: "🍳",
  LUNCH: "🥗",
  DINNER: "🍽️",
};

export default function PredictionPanel({ predictions }: { predictions: FacilityPrediction[] }) {
  if (predictions.length === 0) return null;

  const totalSavings = predictions.reduce(
    (s, p) => s + p.meals.reduce((ms, m) => ms + m.potentialSavings, 0),
    0
  );

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Smart Prep Predictions</h3>
          <p className="text-xs text-slate-400">
            Recommended counts for {predictions[0]?.dayOfWeek} based on a 4-week moving average
          </p>
        </div>
        {totalSavings > 0 && (
          <div className="rounded-lg bg-emerald-50 px-3 py-1.5">
            <p className="text-xs font-semibold text-emerald-700">
              Save {totalSavings} meals vs. historical avg
            </p>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {predictions.map((p) => (
          <div key={p.facilityId} className="px-6 py-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.facility}</p>
                <p className="text-xs text-slate-400">
                  {p.currentOccupancy} of {p.totalBeds} beds occupied
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {p.meals.map((m) => (
                <div key={m.mealType} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{MEAL_ICONS[m.mealType]}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {m.mealType}
                      </span>
                    </div>
                    {m.potentialSavings > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        −{m.potentialSavings}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{m.recommendedPrep}</p>
                  <p className="text-xs text-slate-400">recommended prep</p>
                  <div className="mt-3 space-y-1 border-t border-slate-200 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Expected diners</span>
                      <span className="text-xs font-semibold text-slate-700">{m.expectedDiners}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Historical avg</span>
                      <span className="text-xs font-semibold text-slate-700">{m.historicalAvgPrepped}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Hist. waste %</span>
                      <span className="text-xs font-semibold text-amber-600">{m.historicalWastePct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
