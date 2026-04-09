import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MismatchStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status } = body as { id: string; status: string };

  if (!id || !["REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid id or status" },
      { status: 400 }
    );
  }

  const updated = await prisma.revenueMismatch.update({
    where: { id },
    data: { status: status as MismatchStatus },
  });

  return NextResponse.json({ success: true, mismatch: updated });
}
