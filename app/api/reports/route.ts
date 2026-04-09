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

  const reportType = req.nextUrl.searchParams.get("type") || "revenue_leakage";
  const facilityId = req.nextUrl.searchParams.get("facilityId");
  const dateFrom = req.nextUrl.searchParams.get("dateFrom");
  const dateTo = req.nextUrl.searchParams.get("dateTo");

  const facilities = await prisma.facility.findMany({
    where: { organizationId: orgId },
  });

  const facilityIds = facilityId
    ? [facilityId]
    : facilities.map((f) => f.id);

  const now = new Date();
  const billingDateFilter: Record<string, unknown> = {};
  if (dateFrom) billingDateFilter.gte = new Date(dateFrom);
  if (dateTo) billingDateFilter.lte = new Date(dateTo);
  const hasBillingDateFilter = dateFrom || dateTo;

  // ── Revenue Leakage Summary ─────────────────────────
  if (reportType === "revenue_leakage") {
    const mismatches = await prisma.revenueMismatch.findMany({
      where: {
        facilityId: { in: facilityIds },
        ...(hasBillingDateFilter ? { detectedAt: billingDateFilter } : {}),
      },
      include: {
        resident: { select: { firstName: true, lastName: true, careLevel: true } },
        facility: { select: { name: true } },
        carePlanChange: { select: { previousLevel: true, newLevel: true, effectiveDate: true, documentedBy: true } },
        billingRecord: { select: { billingMonth: true, amountBilled: true } },
      },
      orderBy: { detectedAt: "desc" },
    });

    const totalLeakage = mismatches.reduce((s, m) => s + Number(m.monthlyGap), 0);
    const byFacility = facilities.map((f) => {
      const fm = mismatches.filter((m) => m.facilityId === f.id);
      return {
        facility: f.name,
        count: fm.length,
        amount: fm.reduce((s, m) => s + Number(m.monthlyGap), 0),
      };
    }).filter((f) => f.count > 0);

    const byStatus = {
      detected: mismatches.filter((m) => m.status === "DETECTED").length,
      reviewed: mismatches.filter((m) => m.status === "REVIEWED").length,
      resolved: mismatches.filter((m) => m.status === "RESOLVED").length,
      dismissed: mismatches.filter((m) => m.status === "DISMISSED").length,
    };

    return NextResponse.json({
      reportType,
      title: "Revenue Leakage Summary",
      generatedAt: now.toISOString(),
      summary: { totalMismatches: mismatches.length, totalLeakage, byFacility, byStatus },
      rows: mismatches.map((m) => ({
        resident: `${m.resident.firstName} ${m.resident.lastName}`,
        facility: m.facility.name,
        previousLevel: m.carePlanChange.previousLevel,
        newLevel: m.carePlanChange.newLevel,
        expectedRate: Number(m.expectedRate),
        actualRate: Number(m.actualRate),
        monthlyGap: Number(m.monthlyGap),
        status: m.status,
        detectedAt: m.detectedAt,
        changeDate: m.carePlanChange.effectiveDate,
        documentedBy: m.carePlanChange.documentedBy,
      })),
      facilities: facilities.map((f) => ({ id: f.id, name: f.name })),
    });
  }

  // ── AR Aging Report ─────────────────────────────────
  if (reportType === "ar_aging") {
    const outstanding = await prisma.billingRecord.findMany({
      where: {
        resident: { facilityId: { in: facilityIds } },
        paymentStatus: { in: ["OVERDUE", "PARTIAL", "PENDING"] },
        ...(hasBillingDateFilter ? { billingMonth: billingDateFilter } : {}),
      },
      include: {
        resident: {
          select: { firstName: true, lastName: true, contactName: true, contactEmail: true, facility: { select: { name: true } } },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const buckets = { current: 0, days30: 0, days60: 0, days90: 0, days120: 0 };
    const bucketCounts = { current: 0, days30: 0, days60: 0, days90: 0, days120: 0 };

    const rows = outstanding.map((b) => {
      const daysOverdue = Math.max(0, Math.floor((now.getTime() - new Date(b.dueDate).getTime()) / 86400000));
      const balance = Number(b.amountBilled) - Number(b.amountPaid);
      const bucket = daysOverdue <= 0 ? "current" : daysOverdue <= 30 ? "days30" : daysOverdue <= 60 ? "days60" : daysOverdue <= 90 ? "days90" : "days120";
      buckets[bucket] += balance;
      bucketCounts[bucket]++;

      return {
        resident: `${b.resident.firstName} ${b.resident.lastName}`,
        facility: b.resident.facility.name,
        billingMonth: b.billingMonth,
        amountBilled: Number(b.amountBilled),
        amountPaid: Number(b.amountPaid),
        balance,
        dueDate: b.dueDate,
        daysOverdue,
        bucket,
        contactName: b.resident.contactName,
        contactEmail: b.resident.contactEmail,
        paymentStatus: b.paymentStatus,
      };
    });

    const totalOutstanding = Object.values(buckets).reduce((s, v) => s + v, 0);

    return NextResponse.json({
      reportType,
      title: "Accounts Receivable Aging Report",
      generatedAt: now.toISOString(),
      summary: { totalOutstanding, totalInvoices: rows.length, buckets, bucketCounts },
      rows,
      facilities: facilities.map((f) => ({ id: f.id, name: f.name })),
    });
  }

  // ── Occupancy & Revenue Report ──────────────────────
  if (reportType === "occupancy_revenue") {
    const facilityData = await Promise.all(
      facilities.filter((f) => facilityIds.includes(f.id)).map(async (f) => {
        const billing = await prisma.billingRecord.findMany({
          where: {
            resident: { facilityId: f.id },
            ...(hasBillingDateFilter ? { billingMonth: billingDateFilter } : {}),
          },
        });

        const revenue = billing.reduce((s, b) => s + Number(b.amountBilled), 0);
        const collected = billing.reduce((s, b) => s + Number(b.amountPaid), 0);
        const occupancyPct = f.totalBeds > 0 ? Math.round((f.currentOccupancy / f.totalBeds) * 100) : 0;
        const revenuePerBed = f.currentOccupancy > 0 ? Math.round(revenue / f.currentOccupancy) : 0;

        return {
          facility: f.name,
          totalBeds: f.totalBeds,
          occupied: f.currentOccupancy,
          occupancyPct,
          totalBilled: revenue,
          totalCollected: collected,
          collectionRate: revenue > 0 ? Math.round((collected / revenue) * 100) : 0,
          revenuePerBed,
        };
      })
    );

    const totals = {
      totalBeds: facilityData.reduce((s, f) => s + f.totalBeds, 0),
      totalOccupied: facilityData.reduce((s, f) => s + f.occupied, 0),
      totalBilled: facilityData.reduce((s, f) => s + f.totalBilled, 0),
      totalCollected: facilityData.reduce((s, f) => s + f.totalCollected, 0),
    };

    return NextResponse.json({
      reportType,
      title: "Occupancy & Revenue Report",
      generatedAt: now.toISOString(),
      summary: {
        ...totals,
        occupancyRate: totals.totalBeds > 0 ? Math.round((totals.totalOccupied / totals.totalBeds) * 100) : 0,
        collectionRate: totals.totalBilled > 0 ? Math.round((totals.totalCollected / totals.totalBilled) * 100) : 0,
      },
      rows: facilityData,
      facilities: facilities.map((f) => ({ id: f.id, name: f.name })),
    });
  }

  // ── Monthly Financial Summary ───────────────────────
  if (reportType === "monthly_financial") {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      if (hasBillingDateFilter) {
        if (dateFrom && monthEnd <= new Date(dateFrom)) continue;
        if (dateTo && monthStart > new Date(dateTo)) continue;
      }

      const billing = await prisma.billingRecord.findMany({
        where: {
          resident: { facilityId: { in: facilityIds } },
          billingMonth: { gte: monthStart, lt: monthEnd },
        },
      });

      const billed = billing.reduce((s, b) => s + Number(b.amountBilled), 0);
      const collected = billing.reduce((s, b) => s + Number(b.amountPaid), 0);
      const outstanding = billed - collected;
      const paidCount = billing.filter((b) => b.paymentStatus === "PAID").length;
      const overdueCount = billing.filter((b) => b.paymentStatus === "OVERDUE").length;

      months.push({
        month: monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        monthKey: monthStart.toISOString(),
        billed,
        collected,
        outstanding,
        collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
        invoiceCount: billing.length,
        paidCount,
        overdueCount,
        estimatedExpenses: Math.round(billed * 0.65),
        netIncome: Math.round(billed * 0.35),
      });
    }

    const totalBilled = months.reduce((s, m) => s + m.billed, 0);
    const totalCollected = months.reduce((s, m) => s + m.collected, 0);

    return NextResponse.json({
      reportType,
      title: "Monthly Financial Summary",
      generatedAt: now.toISOString(),
      summary: {
        totalBilled,
        totalCollected,
        avgMonthlyRevenue: months.length > 0 ? Math.round(totalBilled / months.length) : 0,
        overallCollectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
      },
      rows: months,
      facilities: facilities.map((f) => ({ id: f.id, name: f.name })),
    });
  }

  // ── Care Level Distribution ─────────────────────────
  if (reportType === "care_level_distribution") {
    const residents = await prisma.resident.findMany({
      where: {
        facilityId: { in: facilityIds },
        status: "ACTIVE",
      },
      include: {
        facility: { select: { name: true } },
      },
    });

    const levels = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "MEMORY_CARE"];
    const distribution = levels.map((level) => {
      const r = residents.filter((res) => res.careLevel === level);
      const avgRate = r.length > 0 ? Math.round(r.reduce((s, res) => s + Number(res.monthlyRate), 0) / r.length) : 0;
      return { level, count: r.length, avgRate, totalRevenue: r.reduce((s, res) => s + Number(res.monthlyRate), 0) };
    });

    // By facility breakdown
    const byFacility = facilities.filter((f) => facilityIds.includes(f.id)).map((f) => {
      const fResidents = residents.filter((r) => r.facility.name === f.name);
      return {
        facility: f.name,
        ...Object.fromEntries(levels.map((l) => [l, fResidents.filter((r) => r.careLevel === l).length])),
        total: fResidents.length,
      };
    });

    // Recent transitions
    const recentChanges = await prisma.carePlanChange.findMany({
      where: {
        resident: { facilityId: { in: facilityIds } },
        ...(hasBillingDateFilter ? { effectiveDate: billingDateFilter } : { effectiveDate: { gte: new Date(now.getTime() - 90 * 86400000) } }),
      },
      include: {
        resident: { select: { firstName: true, lastName: true, facility: { select: { name: true } } } },
      },
      orderBy: { effectiveDate: "desc" },
    });

    return NextResponse.json({
      reportType,
      title: "Care Level Distribution Report",
      generatedAt: now.toISOString(),
      summary: {
        totalResidents: residents.length,
        distribution,
        totalMonthlyRevenue: distribution.reduce((s, d) => s + d.totalRevenue, 0),
      },
      rows: byFacility,
      transitions: recentChanges.map((c) => ({
        resident: `${c.resident.firstName} ${c.resident.lastName}`,
        facility: c.resident.facility.name,
        from: c.previousLevel,
        to: c.newLevel,
        date: c.effectiveDate,
        documentedBy: c.documentedBy,
      })),
      facilities: facilities.map((f) => ({ id: f.id, name: f.name })),
    });
  }

  // ── Custom Report ───────────────────────────────────
  if (reportType === "custom") {
    const metrics = (req.nextUrl.searchParams.get("metrics") || "").split(",").filter(Boolean);

    const result: Record<string, unknown> = {
      reportType: "custom",
      title: "Custom Report",
      generatedAt: now.toISOString(),
      sections: [],
    };

    const sections: Array<{ title: string; data: unknown }> = [];

    if (metrics.includes("occupancy")) {
      const fData = facilities.filter((f) => facilityIds.includes(f.id)).map((f) => ({
        facility: f.name, beds: f.totalBeds, occupied: f.currentOccupancy,
        rate: f.totalBeds > 0 ? Math.round((f.currentOccupancy / f.totalBeds) * 100) : 0,
      }));
      sections.push({ title: "Occupancy", data: fData });
    }

    if (metrics.includes("revenue")) {
      const billing = await prisma.billingRecord.findMany({
        where: {
          resident: { facilityId: { in: facilityIds } },
          ...(hasBillingDateFilter ? { billingMonth: billingDateFilter } : {}),
        },
      });
      const billed = billing.reduce((s, b) => s + Number(b.amountBilled), 0);
      const collected = billing.reduce((s, b) => s + Number(b.amountPaid), 0);
      sections.push({ title: "Revenue", data: { billed, collected, outstanding: billed - collected } });
    }

    if (metrics.includes("leakage")) {
      const mismatches = await prisma.revenueMismatch.findMany({
        where: { facilityId: { in: facilityIds } },
      });
      sections.push({
        title: "Revenue Leakage",
        data: { count: mismatches.length, totalGap: mismatches.reduce((s, m) => s + Number(m.monthlyGap), 0) },
      });
    }

    if (metrics.includes("ar_aging")) {
      const outstanding = await prisma.billingRecord.findMany({
        where: {
          resident: { facilityId: { in: facilityIds } },
          paymentStatus: { in: ["OVERDUE", "PARTIAL"] },
        },
      });
      const total = outstanding.reduce((s, b) => s + Number(b.amountBilled) - Number(b.amountPaid), 0);
      sections.push({ title: "AR Outstanding", data: { invoices: outstanding.length, total } });
    }

    if (metrics.includes("care_levels")) {
      const residents = await prisma.resident.findMany({
        where: { facilityId: { in: facilityIds }, status: "ACTIVE" },
      });
      const dist = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "MEMORY_CARE"].map((l) => ({
        level: l, count: residents.filter((r) => r.careLevel === l).length,
      }));
      sections.push({ title: "Care Level Distribution", data: dist });
    }

    if (metrics.includes("communications")) {
      const comms = await prisma.communicationLog.count();
      const pending = await prisma.communicationSchedule.count({ where: { status: "PENDING" } });
      sections.push({ title: "Communications", data: { totalSent: comms, pending } });
    }

    result.sections = sections;
    result.facilities = facilities.map((f) => ({ id: f.id, name: f.name }));
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
}
