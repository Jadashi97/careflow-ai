import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mismatches = await prisma.revenueMismatch.findMany({
    include: {
      resident: { include: { facility: true } },
      carePlanChange: true,
      billingRecord: true,
    },
    orderBy: { monthlyGap: "desc" },
  });

  const totalMonthlyLeakage = mismatches.reduce(
    (s, m) => s + Math.abs(Number(m.monthlyGap)),
    0
  );
  const uniqueResidents = new Set(mismatches.map((m) => m.residentId));

  // Build CSV for export (more reliable than client-side PDF for data)
  const rows = mismatches.map((m) => ({
    resident: `${m.resident.firstName} ${m.resident.lastName}`,
    room: m.resident.roomNumber,
    facility: m.resident.facility.name,
    carePlanLevel: m.carePlanChange.newLevel,
    billedLevel: m.billingRecord.careLevel,
    expectedRate: Number(m.expectedRate).toFixed(2),
    actualRate: Number(m.actualRate).toFixed(2),
    monthlyGap: Number(m.monthlyGap).toFixed(2),
    status: m.status,
    detectedAt: new Date(m.detectedAt).toISOString().split("T")[0],
  }));

  // Return JSON data for client-side PDF generation
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    organizationName: (session.user as { organizationName?: string }).organizationName || "Organization",
    summary: {
      totalMonthlyLeakage,
      totalAnnualProjectedLeakage: totalMonthlyLeakage * 12,
      affectedResidents: uniqueResidents.size,
      totalMismatches: mismatches.length,
    },
    mismatches: rows,
  });
}
