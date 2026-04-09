import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExtendedUser } from "@/lib/types";

// GET — list all templates for the org
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as ExtendedUser;

  const templates = await prisma.emailTemplate.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates });
}

// POST — create a new template
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as ExtendedUser;
  const body = await req.json();

  const template = await prisma.emailTemplate.create({
    data: {
      name: body.name,
      subject: body.subject,
      body: body.body,
      type: body.type,
      isDefault: body.isDefault || false,
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}

// PATCH — update a template
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const template = await prisma.emailTemplate.update({
    where: { id: body.id },
    data: {
      name: body.name,
      subject: body.subject,
      body: body.body,
      type: body.type,
    },
  });

  return NextResponse.json({ template });
}

// DELETE — remove a template
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  await prisma.emailTemplate.delete({ where: { id: body.id } });

  return NextResponse.json({ success: true });
}
