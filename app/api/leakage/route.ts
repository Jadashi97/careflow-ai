import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CARE_LEVEL_RATES } from "@/lib/analysis/detectMismatches";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Build where clause
  const where: Record<string, unknown> = {};
  if (facilityId) where.facilityId = facilityId;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.detectedAt = {};
    if (dateFrom) (where.detectedAt as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.detectedAt as Record<string, unknown>).lte = new Date(dateTo);
  }

  const mismatches = await prisma.revenueMismatch.findMany({
    where,
    include: {
      resident: { include: { facility: true } },
      carePlanChange: true,
      billingRecord: true,
    },
    orderBy: { monthlyGap: "desc" },
  });

  // Build mismatch details
  const details = mismatches.map((m) => ({
    id: m.id,
    residentId: m.resident.id,
    residentName: `${m.resident.firstName} ${m.resident.lastName}`,
    roomNumber: m.resident.roomNumber,
    facilityId: m.resident.facilityId,
    facilityName: m.resident.facility.name,
    carePlanLevel: m.carePlanChange.newLevel,
    billingLevel: m.billingRecord.careLevel,
    expectedRate: Number(m.expectedRate),
    actualRate: Number(m.actualRate),
    monthlyGap: Number(m.monthlyGap),
    billingMonth: m.billingRecord.billingMonth,
    careChangeDate: m.carePlanChange.effectiveDate,
    daysSinceCareChange: Math.floor(
      (Date.now() - new Date(m.carePlanChange.effectiveDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    documentedBy: m.carePlanChange.documentedBy,
    status: m.status,
    detectedAt: m.detectedAt,
  }));

  // Aggregate stats
  const totalMonthlyLeakage = details.reduce(
    (sum, d) => sum + Math.abs(d.monthlyGap),
    0
  );
  const uniqueResidents = new Set(details.map((d) => d.residentId));
  const avgDays =
    details.length > 0
      ? Math.round(
          details.reduce((s, d) => s + d.daysSinceCareChange, 0) / details.length
        )
      : 0;

  // Leakage by facility
  const byFacility: Record<string, { name: string; amount: number; count: number }> = {};
  for (const d of details) {
    if (!byFacility[d.facilityId]) {
      byFacility[d.facilityId] = { name: d.facilityName, amount: 0, count: 0 };
    }
    byFacility[d.facilityId].amount += Math.abs(d.monthlyGap);
    byFacility[d.facilityId].count++;
  }

  // Leakage trend (past 6 months) — from billing records with mismatches
  const now = new Date();
  const trend: { month: string; leakage: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = monthDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const monthMismatches = mismatches.filter((m) => {
      const billing = new Date(m.billingRecord.billingMonth);
      return billing >= monthStart && billing <= monthEnd;
    });

    const monthLeakage = monthMismatches.reduce(
      (sum, m) => sum + Math.abs(Number(m.monthlyGap)),
      0
    );
    trend.push({ month: monthStr, leakage: monthLeakage });
  }

  // Facilities list for filter
  const orgId = (session.user as { organizationId?: string }).organizationId;
  const facilities = await prisma.facility.findMany({
    where: orgId ? { organizationId: orgId } : undefined,
    select: { id: true, name: true },
  });

  return NextResponse.json({
    mismatches: details,
    stats: {
      totalMonthlyLeakage,
      totalAnnualProjectedLeakage: totalMonthlyLeakage * 12,
      affectedResidents: uniqueResidents.size,
      totalMismatchedRecords: details.length,
      averageDaysSinceCareChange: avgDays,
    },
    byFacility: Object.values(byFacility),
    trend,
    facilities,
  });
}
