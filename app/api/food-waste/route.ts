import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExtendedUser } from "@/lib/types";
import type { MealType } from "@prisma/client";

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
const WASTE_ALERT_THRESHOLD = 0.20;

// ── GET: dashboard data ───────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as ExtendedUser;
  const orgId = user.organizationId;

  const view = req.nextUrl.searchParams.get("view") || "dashboard";
  const facilityId = req.nextUrl.searchParams.get("facilityId");

  const facilities = await prisma.facility.findMany({
    where: { organizationId: orgId },
    orderBy: { name: "asc" },
  });
  const facilityIds = facilityId ? [facilityId] : facilities.map((f) => f.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 86400000);

  // @db.Date round-trips as a UTC midnight Date object across DST/timezones,
  // so we compare by ISO date string instead of millisecond equality.
  const toDateKey = (d: Date | string) => {
    const dt = new Date(d);
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
  };

  // ── Predictions view ──────────────────────────────
  if (view === "predictions") {
    // Build a per-facility prediction for tomorrow's three meals using:
    //   - 4-week moving average for the same day-of-week
    //   - current occupancy of facility
    //   - historical attendance rate
    const tomorrow = new Date(today.getTime() + 86400000);
    const tomorrowDow = tomorrow.getDay();

    const predictions = await Promise.all(
      facilities.filter((f) => facilityIds.includes(f.id)).map(async (f) => {
        const logs = await prisma.mealLog.findMany({
          where: { facilityId: f.id, date: { gte: ninetyDaysAgo } },
        });

        const mealRows = MEAL_TYPES.map((mealType) => {
          const sameMealDow = logs.filter(
            (l) => l.mealType === mealType && new Date(l.date).getDay() === tomorrowDow
          );
          const sameMealAll = logs.filter((l) => l.mealType === mealType);

          // Last 4 same-DOW occurrences for moving average
          const recentSameDow = [...sameMealDow]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4);

          const avgServedDow = recentSameDow.length > 0
            ? recentSameDow.reduce((s, l) => s + l.mealsServed, 0) / recentSameDow.length
            : sameMealAll.reduce((s, l) => s + l.mealsServed, 0) / Math.max(sameMealAll.length, 1);

          const avgWastePct = sameMealAll.length > 0
            ? sameMealAll.reduce((s, l) => s + (l.mealsPrepped > 0 ? l.mealsWasted / l.mealsPrepped : 0), 0) / sameMealAll.length
            : 0.10;

          // Historical avg attendance per resident (so prediction scales with current occupancy)
          const avgServedPerResident = f.currentOccupancy > 0
            ? avgServedDow / f.currentOccupancy
            : 0;
          const expectedDiners = Math.round(f.currentOccupancy * avgServedPerResident);

          // Recommend prep = expected diners + small buffer (5-8%) instead of historical avgWastePct buffer
          // (because the goal is to reduce waste below the historical average)
          const recommendedPrep = Math.round(expectedDiners * 1.06);

          // Historical avg prepped (to show user how much they can save)
          const avgPreppedDow = recentSameDow.length > 0
            ? recentSameDow.reduce((s, l) => s + l.mealsPrepped, 0) / recentSameDow.length
            : 0;

          return {
            mealType,
            recommendedPrep,
            expectedDiners,
            historicalAvgPrepped: Math.round(avgPreppedDow),
            historicalWastePct: Math.round(avgWastePct * 100),
            potentialSavings: Math.max(0, Math.round(avgPreppedDow) - recommendedPrep),
          };
        });

        return {
          facilityId: f.id,
          facility: f.name,
          currentOccupancy: f.currentOccupancy,
          totalBeds: f.totalBeds,
          dayOfWeek: tomorrow.toLocaleDateString("en-US", { weekday: "long" }),
          predictionDate: tomorrow.toISOString(),
          meals: mealRows,
        };
      })
    );

    return NextResponse.json({ predictions, facilities: facilities.map((f) => ({ id: f.id, name: f.name })) });
  }

  // ── Comparison view ───────────────────────────────
  if (view === "comparison") {
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
    const comparison = await Promise.all(
      facilities.map(async (f) => {
        const logs = await prisma.mealLog.findMany({
          where: { facilityId: f.id, date: { gte: thirtyDaysAgo } },
        });

        const totalPrepped = logs.reduce((s, l) => s + l.mealsPrepped, 0);
        const totalServed = logs.reduce((s, l) => s + l.mealsServed, 0);
        const totalWasted = logs.reduce((s, l) => s + l.mealsWasted, 0);
        const wastePct = totalPrepped > 0 ? (totalWasted / totalPrepped) * 100 : 0;
        const wastedCost = logs.reduce((s, l) => s + l.mealsWasted * Number(l.costPerMeal), 0);

        // Per-meal-type breakdown
        const byMealType = MEAL_TYPES.map((mt) => {
          const m = logs.filter((l) => l.mealType === mt);
          const p = m.reduce((s, l) => s + l.mealsPrepped, 0);
          const w = m.reduce((s, l) => s + l.mealsWasted, 0);
          return { mealType: mt, wastePct: p > 0 ? Math.round((w / p) * 100) : 0 };
        });

        return {
          facilityId: f.id,
          facility: f.name,
          totalPrepped,
          totalServed,
          totalWasted,
          wastePct: Math.round(wastePct * 10) / 10,
          wastedCost: Math.round(wastedCost),
          byMealType,
        };
      })
    );

    return NextResponse.json({ comparison });
  }

  // ── Dashboard (default) view ──────────────────────
  const allLogs = await prisma.mealLog.findMany({
    where: {
      facilityId: { in: facilityIds },
      date: { gte: ninetyDaysAgo },
    },
    include: { facility: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  // Today's metrics
  const todayKey = toDateKey(today);
  const todayLogs = allLogs.filter((l) => toDateKey(l.date) === todayKey);
  const todayPrepped = todayLogs.reduce((s, l) => s + l.mealsPrepped, 0);
  const todayWasted = todayLogs.reduce((s, l) => s + l.mealsWasted, 0);
  const todayWastePct = todayPrepped > 0 ? (todayWasted / todayPrepped) * 100 : 0;
  const todayWastedCost = todayLogs.reduce((s, l) => s + l.mealsWasted * Number(l.costPerMeal), 0);

  // Last 7 days metrics
  const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000);
  const weekLogs = allLogs.filter((l) => new Date(l.date) >= sevenDaysAgo);
  const weekPrepped = weekLogs.reduce((s, l) => s + l.mealsPrepped, 0);
  const weekWasted = weekLogs.reduce((s, l) => s + l.mealsWasted, 0);
  const weekWastePct = weekPrepped > 0 ? (weekWasted / weekPrepped) * 100 : 0;
  const weekWastedCost = weekLogs.reduce((s, l) => s + l.mealsWasted * Number(l.costPerMeal), 0);

  // Current month metrics
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLogs = allLogs.filter((l) => new Date(l.date) >= monthStart);
  const monthPrepped = monthLogs.reduce((s, l) => s + l.mealsPrepped, 0);
  const monthWasted = monthLogs.reduce((s, l) => s + l.mealsWasted, 0);
  const monthWastePct = monthPrepped > 0 ? (monthWasted / monthPrepped) * 100 : 0;
  const monthWastedCost = monthLogs.reduce((s, l) => s + l.mealsWasted * Number(l.costPerMeal), 0);

  // 14-day daily trend
  const trendDays: Array<{ date: string; prepped: number; served: number; wasted: number; wastePct: number; cost: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dKey = toDateKey(d);
    const dayLogs = allLogs.filter((l) => toDateKey(l.date) === dKey);
    const p = dayLogs.reduce((s, l) => s + l.mealsPrepped, 0);
    const sv = dayLogs.reduce((s, l) => s + l.mealsServed, 0);
    const w = dayLogs.reduce((s, l) => s + l.mealsWasted, 0);
    trendDays.push({
      date: dKey,
      prepped: p,
      served: sv,
      wasted: w,
      wastePct: p > 0 ? Math.round((w / p) * 1000) / 10 : 0,
      cost: Math.round(dayLogs.reduce((s, l) => s + l.mealsWasted * Number(l.costPerMeal), 0)),
    });
  }

  // Alerts: any meal in the last 7 days that exceeded threshold
  const recentAlerts = weekLogs
    .filter((l) => l.mealsPrepped > 0 && l.mealsWasted / l.mealsPrepped > WASTE_ALERT_THRESHOLD)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12)
    .map((l) => ({
      id: l.id,
      facility: l.facility.name,
      date: l.date,
      mealType: l.mealType,
      mealsPrepped: l.mealsPrepped,
      mealsWasted: l.mealsWasted,
      wastePct: Math.round((l.mealsWasted / l.mealsPrepped) * 1000) / 10,
      wastedCost: Math.round(l.mealsWasted * Number(l.costPerMeal)),
    }));

  // Recent log entries
  const recentLogs = allLogs.slice(0, 15).map((l) => ({
    id: l.id,
    facility: l.facility.name,
    date: l.date,
    mealType: l.mealType,
    mealsPrepped: l.mealsPrepped,
    mealsServed: l.mealsServed,
    mealsWasted: l.mealsWasted,
    wastePct: l.mealsPrepped > 0 ? Math.round((l.mealsWasted / l.mealsPrepped) * 1000) / 10 : 0,
    costPerMeal: Number(l.costPerMeal),
    loggedBy: l.loggedBy,
  }));

  // Per-meal-type breakdown for last 30 days
  const thirty = new Date(today.getTime() - 30 * 86400000);
  const thirtyLogs = allLogs.filter((l) => new Date(l.date) >= thirty);
  const byMealType = MEAL_TYPES.map((mt) => {
    const m = thirtyLogs.filter((l) => l.mealType === mt);
    const p = m.reduce((s, l) => s + l.mealsPrepped, 0);
    const w = m.reduce((s, l) => s + l.mealsWasted, 0);
    const cost = m.reduce((s, l) => s + l.mealsWasted * Number(l.costPerMeal), 0);
    return {
      mealType: mt,
      prepped: p,
      wasted: w,
      wastePct: p > 0 ? Math.round((w / p) * 1000) / 10 : 0,
      wastedCost: Math.round(cost),
    };
  });

  return NextResponse.json({
    today: {
      prepped: todayPrepped,
      wasted: todayWasted,
      wastePct: Math.round(todayWastePct * 10) / 10,
      wastedCost: Math.round(todayWastedCost),
    },
    week: {
      prepped: weekPrepped,
      wasted: weekWasted,
      wastePct: Math.round(weekWastePct * 10) / 10,
      wastedCost: Math.round(weekWastedCost),
    },
    month: {
      prepped: monthPrepped,
      wasted: monthWasted,
      wastePct: Math.round(monthWastePct * 10) / 10,
      wastedCost: Math.round(monthWastedCost),
    },
    trend: trendDays,
    alerts: recentAlerts,
    recentLogs,
    byMealType,
    facilities: facilities.map((f) => ({ id: f.id, name: f.name })),
    threshold: WASTE_ALERT_THRESHOLD,
  });
}

// ── POST: log a meal ──────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as ExtendedUser;

  const body = await req.json();
  const { facilityId, date, mealType, mealsPrepped, mealsServed, costPerMeal, dietaryNotes } = body;

  if (!facilityId || !date || !mealType || mealsPrepped == null || mealsServed == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify facility belongs to org
  const facility = await prisma.facility.findFirst({
    where: { id: facilityId, organizationId: user.organizationId },
  });
  if (!facility) return NextResponse.json({ error: "Facility not found" }, { status: 404 });

  const prepped = Number(mealsPrepped);
  const served = Number(mealsServed);
  if (served > prepped) {
    return NextResponse.json({ error: "Meals served cannot exceed meals prepped" }, { status: 400 });
  }

  const wasted = prepped - served;

  const log = await prisma.mealLog.create({
    data: {
      facilityId,
      date: new Date(date),
      mealType: mealType as MealType,
      mealsPrepped: prepped,
      mealsServed: served,
      mealsWasted: wasted,
      costPerMeal: costPerMeal != null ? Number(costPerMeal) : 8.0,
      dietaryNotes: dietaryNotes || null,
      loggedBy: user.name || user.email || "Unknown",
    },
  });

  return NextResponse.json({ success: true, log });
}
