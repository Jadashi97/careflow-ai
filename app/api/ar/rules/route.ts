import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReminderChannel, ReminderAction } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = (session.user as { organizationId?: string }).organizationId;

  const rules = await prisma.reminderRule.findMany({
    where: orgId ? { organizationId: orgId } : undefined,
    orderBy: { daysOverdue: "asc" },
  });

  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = (session.user as { organizationId?: string }).organizationId;
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const body = await req.json();
  const { name, daysOverdue, channel, action, messageTemplate } = body;

  if (!name || !daysOverdue || !channel || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const rule = await prisma.reminderRule.create({
    data: {
      name,
      daysOverdue: Number(daysOverdue),
      channel: channel as ReminderChannel,
      action: action as ReminderAction,
      messageTemplate: messageTemplate || null,
      organizationId: orgId,
    },
  });

  return NextResponse.json({ success: true, rule });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, isActive } = await req.json();
  if (!id || typeof isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rule = await prisma.reminderRule.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json({ success: true, rule });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.reminderRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
