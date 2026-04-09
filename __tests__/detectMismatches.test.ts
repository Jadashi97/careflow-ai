import { describe, it, expect } from "vitest";
import {
  detectMismatchesPure,
  CARE_LEVEL_RATES,
  ResidentInput,
  CarePlanChangeInput,
  BillingRecordInput,
} from "@/lib/analysis/detectMismatches";

// ── Test Helpers ───────────────────────────────────────

function makeDate(str: string): Date {
  return new Date(str + "T00:00:00.000Z");
}

function makeResident(
  overrides: Partial<ResidentInput> & {
    carePlanChanges?: CarePlanChangeInput[];
    billingRecords?: BillingRecordInput[];
  } = {}
): ResidentInput {
  return {
    id: "res-1",
    firstName: "Margaret",
    lastName: "Anderson",
    facilityId: "fac-1",
    facilityName: "Sunrise Gardens",
    roomNumber: "101",
    careLevel: "LEVEL_2",
    status: "ACTIVE",
    carePlanChanges: [],
    billingRecords: [],
    ...overrides,
  };
}

function makeCarePlanChange(
  overrides: Partial<CarePlanChangeInput> = {}
): CarePlanChangeInput {
  return {
    id: "cpc-1",
    residentId: "res-1",
    previousLevel: "LEVEL_1",
    newLevel: "LEVEL_2",
    effectiveDate: makeDate("2025-03-10"),
    documentedBy: "Dr. Maria Santos",
    ...overrides,
  };
}

function makeBillingRecord(
  overrides: Partial<BillingRecordInput> = {}
): BillingRecordInput {
  return {
    id: "br-1",
    residentId: "res-1",
    billingMonth: makeDate("2025-03-01"),
    careLevel: "LEVEL_1",
    amountBilled: CARE_LEVEL_RATES.LEVEL_1,
    ...overrides,
  };
}

const REF_DATE = makeDate("2025-04-15");

// ── Tests ──────────────────────────────────────────────

describe("detectMismatchesPure", () => {
  describe("Basic mismatch detection", () => {
    it("detects a mismatch when billing level is lower than care plan level", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            previousLevel: "LEVEL_1",
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-03-10"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1", // Still billing at old level
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);

      expect(result.mismatches).toHaveLength(1);
      expect(result.mismatches[0].carePlanLevel).toBe("LEVEL_3");
      expect(result.mismatches[0].billingLevel).toBe("LEVEL_1");
      expect(result.mismatches[0].expectedRate).toBe(CARE_LEVEL_RATES.LEVEL_3);
      expect(result.mismatches[0].actualRate).toBe(CARE_LEVEL_RATES.LEVEL_1);
      expect(result.mismatches[0].monthlyGap).toBe(
        CARE_LEVEL_RATES.LEVEL_3 - CARE_LEVEL_RATES.LEVEL_1
      );
    });

    it("does NOT flag a mismatch when billing matches the care plan", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            previousLevel: "LEVEL_1",
            newLevel: "LEVEL_2",
            effectiveDate: makeDate("2025-03-10"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_2", // Correctly updated
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(0);
    });

    it("detects mismatches across multiple subsequent months", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-02-15"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            id: "br-feb",
            billingMonth: makeDate("2025-02-01"),
            careLevel: "LEVEL_1",
          }),
          makeBillingRecord({
            id: "br-mar",
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1",
          }),
          makeBillingRecord({
            id: "br-apr",
            billingMonth: makeDate("2025-04-01"),
            careLevel: "LEVEL_1",
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(3);
    });

    it("ignores billing months before the care plan change", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-03-15"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            id: "br-jan",
            billingMonth: makeDate("2025-01-01"),
            careLevel: "LEVEL_1",
          }),
          makeBillingRecord({
            id: "br-feb",
            billingMonth: makeDate("2025-02-01"),
            careLevel: "LEVEL_1",
          }),
          makeBillingRecord({
            id: "br-mar",
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1", // This month IS affected (change is mid-March)
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      // Only March should be flagged (change effective in March)
      expect(result.mismatches).toHaveLength(1);
      expect(result.mismatches[0].billingMonth.toISOString()).toContain("2025-03");
    });
  });

  describe("Same-day updates", () => {
    it("does not flag when care change and billing update happen on the same day", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-03-01"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_3", // Already updated to correct level
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(0);
    });

    it("flags when care change is on the 1st but billing was created at old level", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_4",
            effectiveDate: makeDate("2025-03-01"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_2", // Billing not yet updated
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(1);
      expect(result.mismatches[0].monthlyGap).toBe(
        CARE_LEVEL_RATES.LEVEL_4 - CARE_LEVEL_RATES.LEVEL_2
      );
    });
  });

  describe("Retroactive changes", () => {
    it("detects mismatches for retroactive care plan changes", () => {
      // Care plan change backdated to January, but we're now in April
      // Billing for Jan, Feb, Mar all still at old level
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-01-15"), // Retroactive
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            id: "br-jan",
            billingMonth: makeDate("2025-01-01"),
            careLevel: "LEVEL_1",
          }),
          makeBillingRecord({
            id: "br-feb",
            billingMonth: makeDate("2025-02-01"),
            careLevel: "LEVEL_1",
          }),
          makeBillingRecord({
            id: "br-mar",
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1",
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(3);
      // Total gap should be 3 months of under-billing
      const expectedGap = CARE_LEVEL_RATES.LEVEL_3 - CARE_LEVEL_RATES.LEVEL_1;
      expect(result.stats.totalMonthlyLeakage).toBe(expectedGap * 3);
    });

    it("correctly handles partially corrected retroactive changes", () => {
      // Care level changed retroactively, but Feb was already corrected
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-01-15"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            id: "br-jan",
            billingMonth: makeDate("2025-01-01"),
            careLevel: "LEVEL_1", // Not corrected
          }),
          makeBillingRecord({
            id: "br-feb",
            billingMonth: makeDate("2025-02-01"),
            careLevel: "LEVEL_3", // Already corrected
          }),
          makeBillingRecord({
            id: "br-mar",
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1", // Not corrected
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(2); // Jan and Mar
    });
  });

  describe("Discharged residents", () => {
    it("skips discharged residents entirely", () => {
      const resident = makeResident({
        status: "DISCHARGED",
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-03-10"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1",
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(0);
      expect(result.stats.affectedResidents).toBe(0);
    });

    it("skips deceased residents entirely", () => {
      const resident = makeResident({
        status: "DECEASED",
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-03-10"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1",
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(0);
    });
  });

  describe("Multiple care plan changes (superseding)", () => {
    it("uses the most recent care plan change for a given billing month", () => {
      // Two care level changes: first to L2, then to L4
      // Billing should be compared against L4, not L2
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            id: "cpc-1",
            newLevel: "LEVEL_2",
            effectiveDate: makeDate("2025-02-01"),
          }),
          makeCarePlanChange({
            id: "cpc-2",
            previousLevel: "LEVEL_2",
            newLevel: "LEVEL_4",
            effectiveDate: makeDate("2025-03-01"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            id: "br-mar",
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1", // Way behind
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);

      // The March billing should be compared against LEVEL_4 (most recent change)
      // not LEVEL_2 (older change that is superseded)
      const marchMismatches = result.mismatches.filter(
        (m) => m.billingMonth.toISOString().includes("2025-03")
      );
      expect(marchMismatches).toHaveLength(1);
      expect(marchMismatches[0].carePlanLevel).toBe("LEVEL_4");
    });

    it("correctly applies different changes to different billing months", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            id: "cpc-1",
            newLevel: "LEVEL_2",
            effectiveDate: makeDate("2025-02-01"),
          }),
          makeCarePlanChange({
            id: "cpc-2",
            previousLevel: "LEVEL_2",
            newLevel: "LEVEL_4",
            effectiveDate: makeDate("2025-04-01"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            id: "br-feb",
            billingMonth: makeDate("2025-02-01"),
            careLevel: "LEVEL_1", // Should compare against LEVEL_2
          }),
          makeBillingRecord({
            id: "br-mar",
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1", // Should compare against LEVEL_2
          }),
          makeBillingRecord({
            id: "br-apr",
            billingMonth: makeDate("2025-04-01"),
            careLevel: "LEVEL_1", // Should compare against LEVEL_4
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);

      const febMismatch = result.mismatches.find((m) =>
        m.billingMonth.toISOString().includes("2025-02")
      );
      const marMismatch = result.mismatches.find((m) =>
        m.billingMonth.toISOString().includes("2025-03")
      );
      const aprMismatch = result.mismatches.find((m) =>
        m.billingMonth.toISOString().includes("2025-04")
      );

      expect(febMismatch?.carePlanLevel).toBe("LEVEL_2");
      expect(marMismatch?.carePlanLevel).toBe("LEVEL_2");
      expect(aprMismatch?.carePlanLevel).toBe("LEVEL_4");
    });
  });

  describe("Downgrade detection (over-billing)", () => {
    it("detects over-billing when care level was downgraded but billing wasn't", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            previousLevel: "LEVEL_4",
            newLevel: "LEVEL_2",
            effectiveDate: makeDate("2025-03-10"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_4", // Still billing at old higher level
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(1);
      // Gap should be negative (over-billing)
      expect(result.mismatches[0].monthlyGap).toBe(
        CARE_LEVEL_RATES.LEVEL_2 - CARE_LEVEL_RATES.LEVEL_4
      );
      // But totalMonthlyLeakage uses absolute value
      expect(result.stats.totalMonthlyLeakage).toBe(
        Math.abs(CARE_LEVEL_RATES.LEVEL_2 - CARE_LEVEL_RATES.LEVEL_4)
      );
    });
  });

  describe("Memory Care transitions", () => {
    it("detects mismatch for Memory Care upgrade", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            previousLevel: "LEVEL_3",
            newLevel: "MEMORY_CARE",
            effectiveDate: makeDate("2025-03-01"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_3",
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(1);
      expect(result.mismatches[0].expectedRate).toBe(CARE_LEVEL_RATES.MEMORY_CARE);
      expect(result.mismatches[0].monthlyGap).toBe(
        CARE_LEVEL_RATES.MEMORY_CARE - CARE_LEVEL_RATES.LEVEL_3
      );
    });
  });

  describe("Aggregate statistics", () => {
    it("calculates correct aggregate stats across multiple residents", () => {
      const residents: ResidentInput[] = [
        makeResident({
          id: "res-1",
          firstName: "Margaret",
          lastName: "Anderson",
          facilityId: "fac-1",
          facilityName: "Sunrise Gardens",
          carePlanChanges: [
            makeCarePlanChange({
              id: "cpc-1",
              residentId: "res-1",
              newLevel: "LEVEL_3",
              effectiveDate: makeDate("2025-03-10"),
            }),
          ],
          billingRecords: [
            makeBillingRecord({
              id: "br-1",
              residentId: "res-1",
              billingMonth: makeDate("2025-03-01"),
              careLevel: "LEVEL_1",
            }),
          ],
        }),
        makeResident({
          id: "res-2",
          firstName: "Robert",
          lastName: "Baker",
          facilityId: "fac-2",
          facilityName: "Sunrise Meadows",
          carePlanChanges: [
            makeCarePlanChange({
              id: "cpc-2",
              residentId: "res-2",
              newLevel: "LEVEL_4",
              effectiveDate: makeDate("2025-03-05"),
            }),
          ],
          billingRecords: [
            makeBillingRecord({
              id: "br-2",
              residentId: "res-2",
              billingMonth: makeDate("2025-03-01"),
              careLevel: "LEVEL_2",
            }),
          ],
        }),
      ];

      const result = detectMismatchesPure(residents, REF_DATE);

      expect(result.stats.affectedResidents).toBe(2);
      expect(result.stats.totalMismatchedRecords).toBe(2);

      const gap1 = CARE_LEVEL_RATES.LEVEL_3 - CARE_LEVEL_RATES.LEVEL_1; // 2300
      const gap2 = CARE_LEVEL_RATES.LEVEL_4 - CARE_LEVEL_RATES.LEVEL_2; // 2700
      expect(result.stats.totalMonthlyLeakage).toBe(gap1 + gap2);
      expect(result.stats.totalAnnualProjectedLeakage).toBe((gap1 + gap2) * 12);
    });

    it("calculates average days since care change correctly", () => {
      const refDate = makeDate("2025-04-10");
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            id: "cpc-1",
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-03-11"), // 30 days ago
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            id: "br-1",
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1",
          }),
        ],
      });

      const result = detectMismatchesPure([resident], refDate);
      expect(result.stats.averageDaysSinceCareChange).toBe(30);
    });

    it("groups leakage by facility correctly", () => {
      const residents: ResidentInput[] = [
        makeResident({
          id: "res-1",
          facilityId: "fac-1",
          facilityName: "Facility A",
          carePlanChanges: [
            makeCarePlanChange({
              id: "cpc-1",
              residentId: "res-1",
              newLevel: "LEVEL_2",
              effectiveDate: makeDate("2025-03-01"),
            }),
          ],
          billingRecords: [
            makeBillingRecord({
              id: "br-1",
              residentId: "res-1",
              billingMonth: makeDate("2025-03-01"),
              careLevel: "LEVEL_1",
            }),
          ],
        }),
        makeResident({
          id: "res-2",
          facilityId: "fac-1",
          facilityName: "Facility A",
          carePlanChanges: [
            makeCarePlanChange({
              id: "cpc-2",
              residentId: "res-2",
              newLevel: "LEVEL_3",
              effectiveDate: makeDate("2025-03-01"),
            }),
          ],
          billingRecords: [
            makeBillingRecord({
              id: "br-2",
              residentId: "res-2",
              billingMonth: makeDate("2025-03-01"),
              careLevel: "LEVEL_1",
            }),
          ],
        }),
      ];

      const result = detectMismatchesPure(residents, REF_DATE);

      expect(result.stats.leakageByFacility["fac-1"]).toBeDefined();
      expect(result.stats.leakageByFacility["fac-1"].count).toBe(2);
      expect(result.stats.leakageByFacility["fac-1"].name).toBe("Facility A");
    });

    it("groups leakage by care level transition correctly", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-03-01"),
          }),
        ],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1",
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.stats.leakageByCareLevel["LEVEL_1 → LEVEL_3"]).toBeDefined();
      expect(result.stats.leakageByCareLevel["LEVEL_1 → LEVEL_3"].count).toBe(1);
    });
  });

  describe("Edge cases", () => {
    it("returns empty results for residents with no care plan changes", () => {
      const resident = makeResident({
        carePlanChanges: [],
        billingRecords: [
          makeBillingRecord({
            billingMonth: makeDate("2025-03-01"),
            careLevel: "LEVEL_1",
          }),
        ],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(0);
      expect(result.stats.totalMonthlyLeakage).toBe(0);
    });

    it("returns empty results for empty resident list", () => {
      const result = detectMismatchesPure([], REF_DATE);
      expect(result.mismatches).toHaveLength(0);
      expect(result.stats.affectedResidents).toBe(0);
      expect(result.stats.totalMonthlyLeakage).toBe(0);
      expect(result.stats.averageDaysSinceCareChange).toBe(0);
    });

    it("handles residents with care plan changes but no billing records", () => {
      const resident = makeResident({
        carePlanChanges: [
          makeCarePlanChange({
            newLevel: "LEVEL_3",
            effectiveDate: makeDate("2025-03-10"),
          }),
        ],
        billingRecords: [],
      });

      const result = detectMismatchesPure([resident], REF_DATE);
      expect(result.mismatches).toHaveLength(0);
    });

    it("handles rate table correctly for all care levels", () => {
      expect(CARE_LEVEL_RATES.LEVEL_1).toBe(4500);
      expect(CARE_LEVEL_RATES.LEVEL_2).toBe(5500);
      expect(CARE_LEVEL_RATES.LEVEL_3).toBe(6800);
      expect(CARE_LEVEL_RATES.LEVEL_4).toBe(8200);
      expect(CARE_LEVEL_RATES.MEMORY_CARE).toBe(7500);
    });
  });
});
