import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, ids } = (await req.json()) as {
    action: "remind" | "escalate" | "mark_paid";
    ids: string[];
  };

  if (!ids?.length || !action) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const records = await prisma.billingRecord.findMany({
    where: { id: { in: ids } },
    include: { resident: true },
  });

  let processed = 0;

  for (const record of records) {
    if (action === "mark_paid") {
      await prisma.billingRecord.update({
        where: { id: record.id },
        data: {
          paymentStatus: "PAID",
          amountPaid: record.amountBilled,
          paidDate: new Date(),
        },
      });

      await prisma.communicationLog.create({
        data: {
          residentId: record.residentId,
          billingRecordId: record.id,
          channel: "EMAIL",
          action: "SEND_REMINDER",
          subject: `Payment Received — $${Number(record.amountBilled).toLocaleString()}`,
          message: `Payment of $${Number(record.amountBilled).toLocaleString()} marked as received for ${record.resident.firstName} ${record.resident.lastName}.`,
          status: "DELIVERED",
        },
      });
    } else if (action === "remind") {
      await prisma.communicationLog.create({
        data: {
          residentId: record.residentId,
          billingRecordId: record.id,
          channel: "EMAIL",
          action: "SEND_REMINDER",
          subject: `Payment Reminder — $${Number(record.amountBilled).toLocaleString()} Due`,
          message: `Automated reminder sent to ${record.resident.contactEmail || "billing contact"} for overdue balance of $${(Number(record.amountBilled) - Number(record.amountPaid)).toLocaleString()}.`,
          status: "SENT",
        },
      });
    } else if (action === "escalate") {
      await prisma.communicationLog.create({
        data: {
          residentId: record.residentId,
          billingRecordId: record.id,
          channel: "PHONE",
          action: "ESCALATE",
          subject: `Escalation — ${record.resident.firstName} ${record.resident.lastName}`,
          message: `Account escalated for review. Outstanding balance: $${(Number(record.amountBilled) - Number(record.amountPaid)).toLocaleString()}. Contact: ${record.resident.contactName || "N/A"} at ${record.resident.contactPhone || "N/A"}.`,
          status: "SENT",
        },
      });
    }
    processed++;
  }

  return NextResponse.json({
    success: true,
    action,
    processed,
    message:
      action === "mark_paid"
        ? `${processed} invoice(s) marked as paid`
        : action === "remind"
        ? `${processed} reminder(s) sent`
        : `${processed} invoice(s) escalated`,
  });
}
