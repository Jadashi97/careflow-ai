import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = (session.user as { organizationId?: string }).organizationId;

  // Get all outstanding (non-PAID) billing records
  const records = await prisma.billingRecord.findMany({
    where: {
      paymentStatus: { in: ["PENDING", "OVERDUE", "PARTIAL"] },
      resident: { facility: { organizationId: orgId } },
    },
    include: {
      resident: { include: { facility: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();

  // Build invoice details with aging
  const invoices = records.map((r) => {
    const dueDate = new Date(r.dueDate);
    const daysOverdue = Math.max(
      0,
      Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const amountDue = Number(r.amountBilled) - Number(r.amountPaid);

    return {
      id: r.id,
      residentId: r.residentId,
      residentName: `${r.resident.firstName} ${r.resident.lastName}`,
      facilityName: r.resident.facility.name,
      facilityId: r.resident.facilityId,
      amountBilled: Number(r.amountBilled),
      amountPaid: Number(r.amountPaid),
      amountDue,
      dueDate: r.dueDate,
      daysOverdue,
      paymentType: r.resident.paymentType,
      paymentStatus: r.paymentStatus,
      contactName: r.resident.contactName,
      contactPhone: r.resident.contactPhone,
      contactEmail: r.resident.contactEmail,
      billingMonth: r.billingMonth,
    };
  });

  // Aging buckets
  const aging = {
    current: { amount: 0, count: 0 },
    days30: { amount: 0, count: 0 },
    days60: { amount: 0, count: 0 },
    days90: { amount: 0, count: 0 },
    days120: { amount: 0, count: 0 },
  };

  for (const inv of invoices) {
    const bucket =
      inv.daysOverdue <= 0
        ? "current"
        : inv.daysOverdue <= 30
        ? "days30"
        : inv.daysOverdue <= 60
        ? "days60"
        : inv.daysOverdue <= 90
        ? "days90"
        : "days120";
    aging[bucket].amount += inv.amountDue;
    aging[bucket].count++;
  }

  const totalOutstanding = invoices.reduce((s, i) => s + i.amountDue, 0);

  // Get last communication date per resident
  const lastComms = await prisma.communicationLog.groupBy({
    by: ["residentId"],
    _max: { sentAt: true },
  });

  const lastCommMap: Record<string, string> = {};
  for (const lc of lastComms) {
    if (lc._max.sentAt) {
      lastCommMap[lc.residentId] = lc._max.sentAt.toISOString();
    }
  }

  const invoicesWithComm = invoices.map((inv) => ({
    ...inv,
    lastCommunication: lastCommMap[inv.residentId] || null,
  }));

  // Facilities for filters
  const facilities = await prisma.facility.findMany({
    where: orgId ? { organizationId: orgId } : undefined,
    select: { id: true, name: true },
  });

  return NextResponse.json({
    invoices: invoicesWithComm,
    aging,
    totalOutstanding,
    totalInvoices: invoices.length,
    facilities,
  });
}
