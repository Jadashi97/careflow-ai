"use client";

import { useState } from "react";

interface Facility {
  id: string;
  name: string;
}

interface MealLogFormProps {
  facilities: Facility[];
  onLogged: () => void;
  defaultCostPerMeal?: number;
}

const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Breakfast", icon: "🍳" },
  { value: "LUNCH", label: "Lunch", icon: "🥗" },
  { value: "DINNER", label: "Dinner", icon: "🍽️" },
];

const DIETARY_OPTIONS = [
  "Standard",
  "Diabetic-friendly",
  "Low-sodium",
  "Pureed / soft",
  "Gluten-free",
  "Vegetarian",
];

export default function MealLogForm({ facilities, onLogged, defaultCostPerMeal = 8 }: MealLogFormProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || "");
  const [date, setDate] = useState(todayStr);
  const [mealType, setMealType] = useState("BREAKFAST");
  const [mealsPrepped, setMealsPrepped] = useState("");
  const [mealsServed, setMealsServed] = useState("");
  const [costPerMeal, setCostPerMeal] = useState(defaultCostPerMeal.toString());
  const [dietary, setDietary] = useState<string[]>(["Standard"]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const prepped = parseInt(mealsPrepped) || 0;
  const served = parseInt(mealsServed) || 0;
  const wasted = Math.max(0, prepped - served);
  const wastePct = prepped > 0 ? (wasted / prepped) * 100 : 0;
  const wastedCost = wasted * (parseFloat(costPerMeal) || 0);

  const toggleDietary = (opt: string) => {
    setDietary((prev) => (prev.includes(opt) ? prev.filter((d) => d !== opt) : [...prev, opt]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId || prepped <= 0 || served < 0 || served > prepped) {
      setMessage({ type: "error", text: "Please enter valid prep and served counts." });
      return;
    }
    setSubmitting(true);
    setMessage(null);

    const res = await fetch("/api/food-waste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facilityId,
        date,
        mealType,
        mealsPrepped: prepped,
        mealsServed: served,
        costPerMeal: parseFloat(costPerMeal) || 8,
        dietaryNotes: dietary.join(", "),
      }),
    });

    if (res.ok) {
      setMessage({ type: "success", text: "Meal log saved successfully" });
      setMealsPrepped("");
      setMealsServed("");
      onLogged();
      setTimeout(() => setMessage(null), 3000);
    } else {
      const err = await res.json();
      setMessage({ type: "error", text: err.error || "Failed to save meal log" });
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Log Today&apos;s Meal</h3>
          <p className="text-xs text-slate-400">Enter meal counts after each service</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Facility</label>
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={todayStr}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Meal type selector */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-slate-500">Meal Type</label>
        <div className="grid grid-cols-3 gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMealType(m.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all ${
                mealType === m.value
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className={`text-xs font-medium ${mealType === m.value ? "text-blue-700" : "text-slate-600"}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Meals Prepared</label>
          <input
            type="number"
            min="0"
            value={mealsPrepped}
            onChange={(e) => setMealsPrepped(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Meals Served</label>
          <input
            type="number"
            min="0"
            max={prepped}
            value={mealsServed}
            onChange={(e) => setMealsServed(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Cost / Meal ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={costPerMeal}
            onChange={(e) => setCostPerMeal(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-slate-500">Dietary Categories</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleDietary(opt)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                dietary.includes(opt)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      {prepped > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-4">
          <div>
            <p className="text-xs text-slate-400">Wasted</p>
            <p className="text-lg font-bold text-slate-900">{wasted}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Waste %</p>
            <p className={`text-lg font-bold ${wastePct > 20 ? "text-red-600" : wastePct > 12 ? "text-amber-600" : "text-emerald-600"}`}>
              {wastePct.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Cost of Waste</p>
            <p className="text-lg font-bold text-slate-900">${wastedCost.toFixed(2)}</p>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={submitting || prepped <= 0 || served > prepped}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Meal Log"}
        </button>
      </div>
    </form>
  );
}
