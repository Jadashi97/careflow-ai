import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDemoData } from "@/lib/demo-seed";

export async function POST() {
  try {
    const summary = await seedDemoData(prisma);

    return NextResponse.json({
      ok: true,
      email: summary.adminEmail,
      password: summary.adminPassword,
      totals: summary.totals,
    });
  } catch (error) {
    console.error("Demo init failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to initialize demo data" },
      { status: 500 },
    );
  }
}
