import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExtendedUser } from "@/lib/types";

// GET — list scheduled communications
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedules = await prisma.communicationSchedule.findMany({
    include: {
      resident: { select: { firstName: true, lastName: true, contactName: true, contactEmail: true } },
      template: { select: { name: true, type: true } },
      rule: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ schedules });
}

// POST — queue a new scheduled communication (from AR rules or manual)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as ExtendedUser;
  const body = await req.json();

  // If sending based on AR rules — find overdue invoices and schedule
  if (body.mode === "auto") {
    const rules = await prisma.reminderRule.findMany({
      where: { organizationId: user.organizationId, isActive: true },
      orderBy: { daysOverdue: "asc" },
    });

    const invoices = await prisma.billingRecord.findMany({
      where: { paymentStatus: { in: ["OVERDUE", "PARTIAL"] } },
      include: { resident: true },
    });

    let queued = 0;
    const now = new Date();

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      for (const rule of rules) {
        if (daysOverdue >= rule.daysOverdue) {
          // Check if already scheduled for this resident + rule combo
          const existing = await prisma.communicationSchedule.findFirst({
            where: {
              residentId: invoice.residentId,
              ruleId: rule.id,
              status: { in: ["PENDING", "SENT"] },
            },
          });

          if (!existing) {
            const message = (rule.messageTemplate || "Payment reminder for {{resident_name}}")
              .replace(/\{resident_name\}/g, `${invoice.resident.firstName} ${invoice.resident.lastName}`)
              .replace(/\{contact_name\}/g, invoice.resident.contactName || "Family Member")
              .replace(/\{amount\}/g, `$${Number(invoice.amountBilled).toLocaleString()}`)
              .replace(/\{due_date\}/g, dueDate.toLocaleDateString("en-US"))
              .replace(/\{facility_name\}/g, "Sunrise Senior Care");

            await prisma.communicationSchedule.create({
              data: {
                scheduledAt: new Date(now.getTime() + 60000), // 1 min from now (simulated)
                channel: rule.channel,
                subject: `${rule.action === "COLLECTIONS" ? "Final Notice" : "Payment Reminder"}: ${invoice.resident.firstName} ${invoice.resident.lastName}`,
                message,
                residentId: invoice.residentId,
                ruleId: rule.id,
              },
            });
            queued++;
          }
        }
      }
    }

    return NextResponse.json({ message: `${queued} communications queued`, queued });
  }

  // Manual schedule
  const schedule = await prisma.communicationSchedule.create({
    data: {
      scheduledAt: new Date(body.scheduledAt),
      channel: body.channel || "EMAIL",
      subject: body.subject,
      message: body.message,
      residentId: body.residentId,
      templateId: body.templateId || null,
    },
  });

  return NextResponse.json({ schedule }, { status: 201 });
}

// PATCH — send or cancel a scheduled communication
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.action === "send") {
    // Simulate sending — update status and create a communication log
    const schedule = await prisma.communicationSchedule.update({
      where: { id: body.id },
      data: { status: "SENT", sentAt: new Date() },
      include: { resident: true },
    });

    // Create a communication log entry
    await prisma.communicationLog.create({
      data: {
        channel: schedule.channel,
        action: "SEND_REMINDER",
        subject: schedule.subject,
        message: schedule.message,
        status: "DELIVERED",
        sentAt: new Date(),
        openedAt: Math.random() < 0.65 ? new Date(Date.now() + 3600000) : null, // 65% open rate
        residentId: schedule.residentId,
        templateId: schedule.templateId,
      },
    });

    return NextResponse.json({ message: "Communication sent", schedule });
  }

  if (body.action === "cancel") {
    const schedule = await prisma.communicationSchedule.update({
      where: { id: body.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ message: "Communication cancelled", schedule });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
