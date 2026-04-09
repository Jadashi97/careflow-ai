import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExtendedUser } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as ExtendedUser;
  const orgId = user.organizationId;

  const facilityFilter = req.nextUrl.searchParams.get("facilityId");
  const dateFrom = req.nextUrl.searchParams.get("dateFrom");
  const dateTo = req.nextUrl.searchParams.get("dateTo");

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // ── Facilities ──────────────────────────────────────
  const facilities = await prisma.facility.findMany({
    where: { organizationId: orgId },
    include: {
      residents: {
        where: { status: "ACTIVE" },
        select: { id: true, monthlyRate: true, careLevel: true },
      },
    },
  });

  const facilityIds = facilityFilter
    ? [facilityFilter]
    : facilities.map((f) => f.id);

  // ── Billing Records ─────────────────────────────────
  const billingWhere: Record<string, unknown> = {
    resident: { facilityId: { in: facilityIds } },
  };

  if (dateFrom || dateTo) {
    billingWhere.billingMonth = {};
    if (dateFrom) (billingWhere.billingMonth as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (billingWhere.billingMonth as Record<string, unknown>).lte = new Date(dateTo);
  }

  // This month's revenue
  const thisMonthBilling = await prisma.billingRecord.findMany({
    where: {
      resident: { facilityId: { in: facilityIds } },
      billingMonth: { gte: thisMonthStart },
    },
  });

  const totalCollectedThisMonth = thisMonthBilling.reduce(
    (sum, b) => sum + Number(b.amountPaid), 0
  );
  const totalBilledThisMonth = thisMonthBilling.reduce(
    (sum, b) => sum + Number(b.amountBilled), 0
  );

  // Last month's revenue for comparison
  const lastMonthBilling = await prisma.billingRecord.findMany({
    where: {
      resident: { facilityId: { in: facilityIds } },
      billingMonth: { gte: lastMonthStart, lt: thisMonthStart },
    },
  });

  const totalBilledLastMonth = lastMonthBilling.reduce(
    (sum, b) => sum + Number(b.amountBilled), 0
  );

  // ── AR Outstanding ──────────────────────────────────
  const outstandingRecords = await prisma.billingRecord.findMany({
    where: {
      resident: { facilityId: { in: facilityIds } },
      paymentStatus: { in: ["OVERDUE", "PARTIAL", "PENDING"] },
    },
  });

  const totalAROutstanding = outstandingRecords.reduce(
    (sum, b) => sum + (Number(b.amountBilled) - Number(b.amountPaid)), 0
  );

  // ── Occupancy ───────────────────────────────────────
  const filteredFacilities = facilityFilter
    ? facilities.filter((f) => f.id === facilityFilter)
    : facilities;

  const totalBeds = filteredFacilities.reduce((s, f) => s + f.totalBeds, 0);
  const totalOccupied = filteredFacilities.reduce((s, f) => s + f.currentOccupancy, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  // ── Revenue Leakage ─────────────────────────────────
  const mismatches = await prisma.revenueMismatch.findMany({
    where: {
      facilityId: { in: facilityIds },
      status: { in: ["DETECTED", "REVIEWED"] },
    },
  });

  const leakageDetected = mismatches.reduce(
    (sum, m) => sum + Number(m.monthlyGap), 0
  );
  const mismatchCount = mismatches.length;

  // ── Net Operating Income (simulated) ────────────────
  // Revenue minus estimated operating costs (65% of revenue as a reasonable proxy)
  const estimatedExpenses = totalBilledThisMonth * 0.65;
  const netOperatingIncome = totalBilledThisMonth - estimatedExpenses;

  // ── Facility Comparison Data ────────────────────────
  const facilityComparison = await Promise.all(
    filteredFacilities.map(async (facility) => {
      // Revenue this month
      const fThisMonth = await prisma.billingRecord.findMany({
        where: {
          resident: { facilityId: facility.id },
          billingMonth: { gte: thisMonthStart },
        },
      });
      const fRevenue = fThisMonth.reduce((s, b) => s + Number(b.amountBilled), 0);

      // Revenue last month
      const fLastMonth = await prisma.billingRecord.findMany({
        where: {
          resident: { facilityId: facility.id },
          billingMonth: { gte: lastMonthStart, lt: thisMonthStart },
        },
      });
      const fLastRevenue = fLastMonth.reduce((s, b) => s + Number(b.amountBilled), 0);

      // AR aging buckets
      const fOutstanding = await prisma.billingRecord.findMany({
        where: {
          resident: { facilityId: facility.id },
          paymentStatus: { in: ["OVERDUE", "PARTIAL"] },
        },
      });

      let arCurrent = 0, ar30 = 0, ar60 = 0, ar90 = 0;
      for (const b of fOutstanding) {
        const daysOverdue = Math.floor((now.getTime() - new Date(b.dueDate).getTime()) / 86400000);
        const amt = Number(b.amountBilled) - Number(b.amountPaid);
        if (daysOverdue <= 0) arCurrent += amt;
        else if (daysOverdue <= 30) ar30 += amt;
        else if (daysOverdue <= 60) ar60 += amt;
        else ar90 += amt;
      }

      // Leakage
      const fMismatches = await prisma.revenueMismatch.findMany({
        where: { facilityId: facility.id, status: { in: ["DETECTED", "REVIEWED"] } },
      });
      const fLeakage = fMismatches.reduce((s, m) => s + Number(m.monthlyGap), 0);

      const occupancyPct = facility.totalBeds > 0
        ? Math.round((facility.currentOccupancy / facility.totalBeds) * 100)
        : 0;

      const revenueTrend = fLastRevenue > 0
        ? ((fRevenue - fLastRevenue) / fLastRevenue) * 100
        : 0;

      return {
        id: facility.id,
        name: facility.name,
        totalBeds: facility.totalBeds,
        currentOccupancy: facility.currentOccupancy,
        occupancyPct,
        revenue: fRevenue,
        revenueLastMonth: fLastRevenue,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
        arTotal: arCurrent + ar30 + ar60 + ar90,
        arCurrent,
        ar30,
        ar60,
        ar90Plus: ar90,
        leakage: fLeakage,
        mismatchCount: fMismatches.length,
      };
    })
  );

  // ── Revenue Trend (12 months by facility) ───────────
  const revenueTrend = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const monthData: Record<string, unknown> = { month: label };

    let monthTotal = 0;
    for (const facility of filteredFacilities) {
      const fBilling = await prisma.billingRecord.findMany({
        where: {
          resident: { facilityId: facility.id },
          billingMonth: { gte: monthStart, lt: monthEnd },
        },
      });
      const rev = fBilling.reduce((s, b) => s + Number(b.amountBilled), 0);
      monthData[facility.name] = rev;
      monthTotal += rev;
    }
    monthData.total = monthTotal;
    revenueTrend.push(monthData);
  }

  // ── Cash Flow Forecast (next 3 months) ──────────────
  const avgMonthlyRevenue = totalBilledThisMonth ||
    (filteredFacilities.reduce((s, f) =>
      s + f.residents.reduce((rs, r) => rs + Number(r.monthlyRate), 0), 0));

  const cashFlowForecast = [];
  for (let i = 1; i <= 3; i++) {
    const forecastMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = forecastMonth.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    // Project with slight growth (1-2% monthly) and collection rate
    const growthFactor = 1 + (Math.random() * 0.02 + 0.005);
    const projectedIncome = Math.round(avgMonthlyRevenue * Math.pow(growthFactor, i));
    const collectionRate = 0.88 + Math.random() * 0.07; // 88-95% collection
    const projectedCollections = Math.round(projectedIncome * collectionRate);
    const projectedExpenses = Math.round(projectedIncome * (0.62 + Math.random() * 0.06));

    cashFlowForecast.push({
      month: label,
      projectedIncome,
      projectedCollections,
      projectedExpenses,
      netCashFlow: projectedCollections - projectedExpenses,
    });
  }

  // ── Quick Actions ───────────────────────────────────
  const mismatchesToReview = await prisma.revenueMismatch.count({
    where: { facilityId: { in: facilityIds }, status: "DETECTED" },
  });

  const overdueInvoices = await prisma.billingRecord.count({
    where: {
      resident: { facilityId: { in: facilityIds } },
      paymentStatus: "OVERDUE",
    },
  });

  // Care plan reviews — residents with changes in last 30 days
  const recentChanges = await prisma.carePlanChange.findMany({
    where: {
      resident: { facilityId: { in: facilityIds } },
      effectiveDate: { gte: new Date(now.getTime() - 30 * 86400000) },
    },
    include: {
      resident: { select: { firstName: true, lastName: true, facilityId: true } },
    },
    orderBy: { effectiveDate: "desc" },
    take: 10,
  });

  const upcomingReviews = recentChanges.map((c) => ({
    id: c.id,
    residentName: `${c.resident.firstName} ${c.resident.lastName}`,
    previousLevel: c.previousLevel,
    newLevel: c.newLevel,
    effectiveDate: c.effectiveDate,
    documentedBy: c.documentedBy,
  }));

  // ── Pending scheduled communications ────────────────
  const pendingComms = await prisma.communicationSchedule.count({
    where: { status: "PENDING" },
  });

  // Revenue change vs last month (billed, since current month hasn't been collected yet)
  const revenueChange = totalBilledLastMonth > 0
    ? Math.round(((totalBilledThisMonth - totalBilledLastMonth) / totalBilledLastMonth) * 1000) / 10
    : 0;

  return NextResponse.json({
    kpis: {
      totalRevenueThisMonth: totalBilledThisMonth,
      totalBilledThisMonth,
      totalCollectedThisMonth,
      totalBilledLastMonth,
      revenueChange,
      totalAROutstanding,
      occupancyRate,
      totalBeds,
      totalOccupied,
      leakageDetected,
      mismatchCount,
      netOperatingIncome,
    },
    facilityComparison,
    revenueTrend,
    cashFlowForecast,
    quickActions: {
      mismatchesToReview,
      overdueInvoices,
      upcomingReviews,
      pendingComms,
    },
    facilities: facilities.map((f) => ({ id: f.id, name: f.name })),
  });
}
