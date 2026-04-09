import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCSV, validateCarePlanCSV } from "@/lib/csv-parser";
import { CareLevel } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = parseCSV(text);
    const { valid, errors } = validateCarePlanCSV(parsed);

    if (errors.length > 0 && valid.length === 0) {
      return NextResponse.json(
        { error: "Validation failed", errors, processed: 0 },
        { status: 400 }
      );
    }

    let processed = 0;
    let skipped = 0;
    const processingErrors: string[] = [...errors];

    for (const row of valid) {
      try {
        // Find the resident by ID or by name + room number
        let resident = await prisma.resident.findUnique({
          where: { id: row.residentId },
        });

        if (!resident) {
          // Try matching by name and room number
          const nameParts = row.residentName.split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ");

          const matches = await prisma.resident.findMany({
            where: {
              firstName: { equals: firstName, mode: "insensitive" },
              lastName: { equals: lastName, mode: "insensitive" },
              roomNumber: row.roomNumber,
            },
          });

          if (matches.length === 1) {
            resident = matches[0];
          } else if (matches.length > 1) {
            processingErrors.push(
              `Row for ${row.residentName}: Multiple residents matched. Skipped.`
            );
            skipped++;
            continue;
          } else {
            processingErrors.push(
              `Row for ${row.residentName}: No matching resident found. Skipped.`
            );
            skipped++;
            continue;
          }
        }

        const newLevel = row.currentCareLevel as CareLevel;
        const previousLevel = resident.careLevel;

        // Only create a care plan change if the level actually changed
        if (previousLevel !== newLevel) {
          await prisma.carePlanChange.create({
            data: {
              residentId: resident.id,
              previousLevel,
              newLevel,
              effectiveDate: new Date(row.effectiveDate),
              documentedBy: row.documentedBy,
            },
          });

          // Update the resident's current care level
          await prisma.resident.update({
            where: { id: resident.id },
            data: { careLevel: newLevel },
          });
        }

        processed++;
      } catch (e) {
        processingErrors.push(
          `Row for ${row.residentName}: Database error — ${(e as Error).message}`
        );
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      skipped,
      total: valid.length,
      errors: processingErrors,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Processing failed: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
