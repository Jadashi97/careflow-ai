"use server";

import { prisma } from "@/lib/prisma";
import { CareLevel, MismatchStatus } from "@prisma/client";

// ── Rate Table ─────────────────────────────────────────

export const CARE_LEVEL_RATES: Record<CareLevel, number> = {
  LEVEL_1: 4500,
  LEVEL_2: 5500,
  LEVEL_3: 6800,
  LEVEL_4: 8200,
  MEMORY_CARE: 7500,
};

// ── Types ──────────────────────────────────────────────

export interface MismatchDetail {
  residentId: string;
  residentName: string;
  facilityId: string;
  facilityName: string;
  roomNumber: string;
  carePlanChangeId: string;
  billingRecordId: string;
  carePlanLevel: CareLevel;
  billingLevel: CareLevel;
  expectedRate: number;
  actualRate: number;
  monthlyGap: number;
  billingMonth: Date;
  careChangeDate: Date;
  daysSinceCareChange: number;
  documentedBy: string;
}

export interface DetectionResult {
  mismatches: MismatchDetail[];
  stats: {
    totalMonthlyLeakage: number;
    totalAnnualProjectedLeakage: number;
    affectedResidents: number;
    totalMismatchedRecords: number;
    averageDaysSinceCareChange: number;
    leakageByFacility: Record<string, { name: string; amount: number; count: number }>;
    leakageByCareLevel: Record<string, { amount: number; count: number }>;
  };
  meta: {
    runAt: Date;
    residentsScanned: number;
    carePlanChangesAnalyzed: number;
    billingRecordsAnalyzed: number;
    newMismatchesDetected: number;
    existingMismatchesSkipped: number;
  };
}

// ── Core Detection Engine ──────────────────────────────

export async function detectMismatches(
  organizationId?: string
): Promise<DetectionResult> {
  const runAt = new Date();

  // ── Step 1: Fetch all active residents with their care plan changes and billing records
  const whereClause = organizationId
    ? { facility: { organizationId }, status: "ACTIVE" as const }
    : { status: "ACTIVE" as const };

  const residents = await prisma.resident.findMany({
    where: whereClause,
    include: {
      facility: true,
      carePlanChanges: {
        orderBy: { effectiveDate: "desc" },
      },
      billingRecords: {
        orderBy: { billingMonth: "desc" },
      },
    },
  });

  // ── Step 2: For each resident, compare care plan changes against billing records
  const mismatches: MismatchDetail[] = [];
  let carePlanChangesAnalyzed = 0;
  let billingRecordsAnalyzed = 0;
  let existingMismatchesSkipped = 0;

  for (const resident of residents) {
    if (resident.carePlanChanges.length === 0) continue;

    for (const change of resident.carePlanChanges) {
      carePlanChangesAnalyzed++;

      const changeMonth = firstOfMonth(change.effectiveDate);
      const expectedRate = CARE_LEVEL_RATES[change.newLevel];

      // Find billing records for the month of the change and all subsequent months
      const affectedBillingRecords = resident.billingRecords.filter((br) => {
        const billingDate = new Date(br.billingMonth);
        return billingDate >= changeMonth;
      });

      for (const billing of affectedBillingRecords) {
        billingRecordsAnalyzed++;

        const billingRate = CARE_LEVEL_RATES[billing.careLevel];

        // Mismatch: billing care level doesn't match the care plan level
        // that should be in effect for this billing month
        if (billing.careLevel !== change.newLevel) {
          // Check if this specific mismatch (change + billing pair) already exists
          const existingMismatch = await prisma.revenueMismatch.findFirst({
            where: {
              carePlanChangeId: change.id,
              billingRecordId: billing.id,
              status: { in: ["DETECTED", "REVIEWED"] },
            },
          });

          if (existingMismatch) {
            existingMismatchesSkipped++;
            continue;
          }

          // But first check: is there a MORE RECENT care plan change that supersedes this one
          // for this billing month? If so, skip — the newer change is what matters.
          const newerChange = resident.carePlanChanges.find((c) => {
            const cMonth = firstOfMonth(c.effectiveDate);
            const bMonth = new Date(billing.billingMonth);
            return (
              c.id !== change.id &&
              c.effectiveDate > change.effectiveDate &&
              cMonth <= bMonth
            );
          });

          if (newerChange) continue; // A more recent change governs this billing month

          const monthlyGap = expectedRate - billingRate;
          const daysSinceCareChange = Math.floor(
            (runAt.getTime() - new Date(change.effectiveDate).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          mismatches.push({
            residentId: resident.id,
            residentName: `${resident.firstName} ${resident.lastName}`,
            facilityId: resident.facilityId,
            facilityName: resident.facility.name,
            roomNumber: resident.roomNumber,
            carePlanChangeId: change.id,
            billingRecordId: billing.id,
            carePlanLevel: change.newLevel,
            billingLevel: billing.careLevel,
            expectedRate,
            actualRate: billingRate,
            monthlyGap,
            billingMonth: new Date(billing.billingMonth),
            careChangeDate: new Date(change.effectiveDate),
            daysSinceCareChange,
            documentedBy: change.documentedBy,
          });
        }
      }
    }
  }

  // ── Step 3: Store new mismatches in the database
  let newMismatchesDetected = 0;

  for (const m of mismatches) {
    await prisma.revenueMismatch.create({
      data: {
        residentId: m.residentId,
        facilityId: m.facilityId,
        carePlanChangeId: m.carePlanChangeId,
        billingRecordId: m.billingRecordId,
        expectedRate: m.expectedRate,
        actualRate: m.actualRate,
        monthlyGap: m.monthlyGap,
        status: MismatchStatus.DETECTED,
        detectedAt: runAt,
      },
    });
    newMismatchesDetected++;
  }

  // ── Step 4: Calculate aggregate stats
  const uniqueResidents = new Set(mismatches.map((m) => m.residentId));

  const totalMonthlyLeakage = mismatches.reduce(
    (sum, m) => sum + Math.abs(m.monthlyGap),
    0
  );

  const averageDaysSinceCareChange =
    mismatches.length > 0
      ? Math.round(
          mismatches.reduce((sum, m) => sum + m.daysSinceCareChange, 0) /
            mismatches.length
        )
      : 0;

  // Leakage by facility
  const leakageByFacility: Record<string, { name: string; amount: number; count: number }> = {};
  for (const m of mismatches) {
    if (!leakageByFacility[m.facilityId]) {
      leakageByFacility[m.facilityId] = { name: m.facilityName, amount: 0, count: 0 };
    }
    leakageByFacility[m.facilityId].amount += Math.abs(m.monthlyGap);
    leakageByFacility[m.facilityId].count++;
  }

  // Leakage by care level transition
  const leakageByCareLevel: Record<string, { amount: number; count: number }> = {};
  for (const m of mismatches) {
    const key = `${m.billingLevel} → ${m.carePlanLevel}`;
    if (!leakageByCareLevel[key]) {
      leakageByCareLevel[key] = { amount: 0, count: 0 };
    }
    leakageByCareLevel[key].amount += Math.abs(m.monthlyGap);
    leakageByCareLevel[key].count++;
  }

  return {
    mismatches,
    stats: {
      totalMonthlyLeakage,
      totalAnnualProjectedLeakage: totalMonthlyLeakage * 12,
      affectedResidents: uniqueResidents.size,
      totalMismatchedRecords: mismatches.length,
      averageDaysSinceCareChange,
      leakageByFacility,
      leakageByCareLevel,
    },
    meta: {
      runAt,
      residentsScanned: residents.length,
      carePlanChangesAnalyzed,
      billingRecordsAnalyzed,
      newMismatchesDetected,
      existingMismatchesSkipped,
    },
  };
}

// ── Pure Logic (Exported for Testing) ──────────────────

export interface CarePlanChangeInput {
  id: string;
  residentId: string;
  previousLevel: CareLevel;
  newLevel: CareLevel;
  effectiveDate: Date;
  documentedBy: string;
}

export interface BillingRecordInput {
  id: string;
  residentId: string;
  billingMonth: Date;
  careLevel: CareLevel;
  amountBilled: number;
}

export interface ResidentInput {
  id: string;
  firstName: string;
  lastName: string;
  facilityId: string;
  facilityName: string;
  roomNumber: string;
  careLevel: CareLevel;
  status: "ACTIVE" | "DISCHARGED" | "DECEASED";
  carePlanChanges: CarePlanChangeInput[];
  billingRecords: BillingRecordInput[];
}

/**
 * Pure function version of the detection algorithm — no database access.
 * Used for unit testing and for scenarios where data is already loaded.
 */
export function detectMismatchesPure(
  residents: ResidentInput[],
  referenceDate: Date = new Date()
): {
  mismatches: MismatchDetail[];
  stats: DetectionResult["stats"];
} {
  const mismatches: MismatchDetail[] = [];

  for (const resident of residents) {
    // Skip discharged/deceased residents
    if (resident.status !== "ACTIVE") continue;
    if (resident.carePlanChanges.length === 0) continue;

    // Sort care plan changes by effective date descending
    const sortedChanges = [...resident.carePlanChanges].sort(
      (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );

    // Sort billing records by billing month descending
    const sortedBilling = [...resident.billingRecords].sort(
      (a, b) => new Date(b.billingMonth).getTime() - new Date(a.billingMonth).getTime()
    );

    for (const change of sortedChanges) {
      const changeMonth = firstOfMonth(new Date(change.effectiveDate));
      const expectedRate = CARE_LEVEL_RATES[change.newLevel];

      // Billing records from the change month onward
      const affectedBilling = sortedBilling.filter((br) => {
        return new Date(br.billingMonth) >= changeMonth;
      });

      for (const billing of affectedBilling) {
        if (billing.careLevel === change.newLevel) continue;

        // Check for a more recent care plan change that supersedes this one
        const newerChange = sortedChanges.find((c) => {
          const cMonth = firstOfMonth(new Date(c.effectiveDate));
          const bMonth = new Date(billing.billingMonth);
          return (
            c.id !== change.id &&
            new Date(c.effectiveDate) > new Date(change.effectiveDate) &&
            cMonth <= bMonth
          );
        });

        if (newerChange) continue;

        const billingRate = CARE_LEVEL_RATES[billing.careLevel];
        const monthlyGap = expectedRate - billingRate;
        const daysSinceCareChange = Math.floor(
          (referenceDate.getTime() - new Date(change.effectiveDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        mismatches.push({
          residentId: resident.id,
          residentName: `${resident.firstName} ${resident.lastName}`,
          facilityId: resident.facilityId,
          facilityName: resident.facilityName,
          roomNumber: resident.roomNumber,
          carePlanChangeId: change.id,
          billingRecordId: billing.id,
          carePlanLevel: change.newLevel,
          billingLevel: billing.careLevel,
          expectedRate,
          actualRate: billingRate,
          monthlyGap,
          billingMonth: new Date(billing.billingMonth),
          careChangeDate: new Date(change.effectiveDate),
          daysSinceCareChange,
          documentedBy: change.documentedBy,
        });
      }
    }
  }

  // Aggregate stats
  const uniqueResidents = new Set(mismatches.map((m) => m.residentId));

  const totalMonthlyLeakage = mismatches.reduce(
    (sum, m) => sum + Math.abs(m.monthlyGap),
    0
  );

  const averageDaysSinceCareChange =
    mismatches.length > 0
      ? Math.round(
          mismatches.reduce((sum, m) => sum + m.daysSinceCareChange, 0) /
            mismatches.length
        )
      : 0;

  const leakageByFacility: Record<string, { name: string; amount: number; count: number }> = {};
  for (const m of mismatches) {
    if (!leakageByFacility[m.facilityId]) {
      leakageByFacility[m.facilityId] = { name: m.facilityName, amount: 0, count: 0 };
    }
    leakageByFacility[m.facilityId].amount += Math.abs(m.monthlyGap);
    leakageByFacility[m.facilityId].count++;
  }

  const leakageByCareLevel: Record<string, { amount: number; count: number }> = {};
  for (const m of mismatches) {
    const key = `${m.billingLevel} → ${m.carePlanLevel}`;
    if (!leakageByCareLevel[key]) {
      leakageByCareLevel[key] = { amount: 0, count: 0 };
    }
    leakageByCareLevel[key].amount += Math.abs(m.monthlyGap);
    leakageByCareLevel[key].count++;
  }

  return {
    mismatches,
    stats: {
      totalMonthlyLeakage,
      totalAnnualProjectedLeakage: totalMonthlyLeakage * 12,
      affectedResidents: uniqueResidents.size,
      totalMismatchedRecords: mismatches.length,
      averageDaysSinceCareChange,
      leakageByFacility,
      leakageByCareLevel,
    },
  };
}

// ── Helpers ────────────────────────────────────────────

function firstOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}
