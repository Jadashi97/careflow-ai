import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST — generate a family portal token for a resident (authenticated)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { residentId } = body;

  // Generate a unique token
  const token = randomBytes(32).toString("hex");

  // Expires in 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const portalToken = await prisma.familyPortalToken.create({
    data: {
      token,
      residentId,
      expiresAt,
    },
  });

  return NextResponse.json({
    token: portalToken.token,
    url: `/family/${portalToken.token}`,
    expiresAt: portalToken.expiresAt,
  });
}

// GET — fetch family portal data by token (unauthenticated)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const portalToken = await prisma.familyPortalToken.findUnique({
    where: { token },
    include: {
      resident: {
        include: {
          facility: { select: { name: true, address: true } },
          billingRecords: {
            orderBy: { billingMonth: "desc" },
            take: 12,
          },
        },
      },
    },
  });

  if (!portalToken || !portalToken.isActive || portalToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  const resident = portalToken.resident;
  const billingRecords = resident.billingRecords;

  // Current balance = sum of unpaid amounts
  const currentBalance = billingRecords
    .filter((b) => b.paymentStatus !== "PAID")
    .reduce((sum, b) => sum + (Number(b.amountBilled) - Number(b.amountPaid)), 0);

  // Payment history (paid records)
  const paymentHistory = billingRecords
    .filter((b) => b.paymentStatus === "PAID" || Number(b.amountPaid) > 0)
    .map((b) => ({
      id: b.id,
      month: b.billingMonth,
      amountBilled: Number(b.amountBilled),
      amountPaid: Number(b.amountPaid),
      paidDate: b.paidDate,
      status: b.paymentStatus,
    }));

  // Upcoming charges (pending/future)
  const upcomingCharges = billingRecords
    .filter((b) => b.paymentStatus === "PENDING")
    .map((b) => ({
      id: b.id,
      month: b.billingMonth,
      amount: Number(b.amountBilled),
      dueDate: b.dueDate,
    }));

  // Also add a projected next month charge
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
  upcomingCharges.push({
    id: "projected",
    month: nextMonth,
    amount: Number(resident.monthlyRate),
    dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15),
  });

  return NextResponse.json({
    resident: {
      name: `${resident.firstName} ${resident.lastName}`,
      facility: resident.facility.name,
      facilityAddress: resident.facility.address,
      roomNumber: resident.roomNumber,
      careLevel: resident.careLevel,
      monthlyRate: Number(resident.monthlyRate),
    },
    currentBalance,
    paymentHistory,
    upcomingCharges,
    tokenExpiresAt: portalToken.expiresAt,
  });
}
