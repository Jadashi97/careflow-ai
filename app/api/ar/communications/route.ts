import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const residentId = searchParams.get("residentId");

  if (!residentId) {
    return NextResponse.json({ error: "residentId required" }, { status: 400 });
  }

  const logs = await prisma.communicationLog.findMany({
    where: { residentId },
    orderBy: { sentAt: "desc" },
    include: {
      billingRecord: {
        select: { billingMonth: true, amountBilled: true },
      },
    },
  });

  return NextResponse.json({ logs });
}
