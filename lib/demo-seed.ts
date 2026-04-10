// Demo seed for the "Prairie Senior Living" sample dataset.
//
// Called from /api/demo/init when the user clicks "Initialize Demo" on the
// login page. Wipes existing data, then creates a self-contained demo:
//   - 1 organization, 3 facilities, 1 admin user
//   - 135 residents (active counts match facility occupancy targets)
//   - 12 months of billing history (95% private-pay rate, 88% Medicaid)
//   - 12 care-plan-to-billing mismatches summing to exactly $8,400/month
//   - 90 days of meal logs averaging ~18% food waste
//   - Default reminder rules, email templates, and a few family tokens

import {
  PrismaClient,
  CareLevel,
  PaymentType,
  ResidentStatus,
  PaymentStatus,
  MealType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_NAME,
  DEMO_ADMIN_PASSWORD,
  DEMO_ORG_NAME,
} from "./demo";

// ── Helpers ────────────────────────────────────────────

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Monthly rates by care level (used for non-mismatch residents)
const RATES: Record<CareLevel, number> = {
  LEVEL_1: 4200,
  LEVEL_2: 5100,
  LEVEL_3: 6400,
  LEVEL_4: 7800,
  MEMORY_CARE: 8900,
};

// ── Minnesota names (Scandinavian / Upper-Midwest heritage) ──

const FIRST_NAMES = [
  "Eleanor", "Doris", "Helen", "Margaret", "Mildred", "Bernice", "Lorraine",
  "Astrid", "Greta", "Ingrid", "Sigrid", "Karen", "Linnea", "Solveig",
  "Marlys", "Darlene", "Beverly", "Gladys", "Esther", "Edna", "Hazel",
  "Pearl", "Ruth", "Alma", "Verna", "Mavis", "Lucille", "Gertrude",
  "Karl", "Erik", "Bernard", "Magnus", "Sven", "Lars", "Olaf", "Leif",
  "Knute", "Gunnar", "Harold", "Norman", "Roland", "Vernon", "Orville",
  "Wilbur", "Clayton", "Clifford", "Kenneth", "Raymond", "Donovan", "Arvid",
  "Alvin", "Lyle", "Marvin", "Wendell", "Floyd", "Howard", "Stanley",
  "Russell", "Walter", "Gerald", "Eugene", "Lawrence", "Clarence", "Earl",
  "Frances", "Florence", "Patricia", "Joyce", "Norma", "Phyllis", "Audrey",
];

const LAST_NAMES = [
  "Olson", "Johnson", "Anderson", "Larson", "Nelson", "Hanson", "Erickson",
  "Peterson", "Carlson", "Lindberg", "Berg", "Lund", "Sorenson", "Swanson",
  "Bergstrom", "Holmberg", "Lindgren", "Sandberg", "Holm", "Strand",
  "Ostrom", "Engstrom", "Gustafson", "Gunderson", "Hagen", "Halvorson",
  "Iverson", "Jacobson", "Knutson", "Lien", "Lindquist", "Lofgren",
  "Magnuson", "Mattson", "Nordquist", "Norgaard", "Pedersen", "Rasmussen",
  "Rosen", "Sather", "Skoglund", "Stenberg", "Thorson", "Westberg",
  "Wickstrom", "Aasen", "Bjornson", "Christianson", "Dahl", "Eklund",
  "Ellingson", "Flom", "Gulbrandson", "Halverson", "Hovland", "Jensen",
  "Kjellberg", "Lindstrom", "Mortenson", "Nystrom", "Ohman", "Pearson",
  "Quale", "Ronning", "Strommen", "Tollefson", "Ulrich", "Vang",
];

const CARE_STAFF = [
  "Dr. Maria Santos", "RN Lisa Chen", "RN James Okafor",
  "Dr. Robert Kim", "LPN Amy Torres", "RN David Patel",
  "Dr. Susan Wright", "RN Karen Foster", "LPN Michael Cruz",
];

const KITCHEN_STAFF = [
  "Chef Anders Lindqvist", "Sous Chef Greta Holm", "Kitchen Lead Erik Sather",
  "Chef Marit Bergstrom", "Pastry Chef Liv Nordquist", "Kitchen Mgr Sven Olson",
];

// Care level distributions per facility (must sum to 1.0).
type CareLevelMix = Partial<Record<CareLevel, number>>;

const PRAIRIE_MEADOWS_MIX: CareLevelMix = {
  LEVEL_1: 0.35,
  LEVEL_2: 0.35,
  LEVEL_3: 0.20,
  LEVEL_4: 0.10,
};

const LAKEVIEW_MEMORY_MIX: CareLevelMix = {
  MEMORY_CARE: 1.0,
};

const OAKWOOD_MIX: CareLevelMix = {
  LEVEL_1: 0.20,
  LEVEL_2: 0.25,
  LEVEL_3: 0.25,
  LEVEL_4: 0.20,
  MEMORY_CARE: 0.10,
};

function pickFromMix(mix: CareLevelMix): CareLevel {
  const r = Math.random();
  let cum = 0;
  for (const [level, weight] of Object.entries(mix)) {
    cum += weight ?? 0;
    if (r < cum) return level as CareLevel;
  }
  // Fallback (should not hit if weights sum to 1.0)
  return (Object.keys(mix)[0] as CareLevel) ?? "LEVEL_1";
}

// ── Main Demo Seed ─────────────────────────────────────

export interface DemoSeedSummary {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminPassword: string;
  totals: {
    facilities: number;
    residents: number;
    activeResidents: number;
    billingRecords: number;
    mismatches: number;
    mismatchMonthlyTotal: number;
    mealLogs: number;
    avgWastePct: number;
    sampleFamilyToken: string | null;
  };
}

export async function seedDemoData(prisma: PrismaClient): Promise<DemoSeedSummary> {
  // ── Wipe in dependency order ─────────────────────────
  await prisma.mealLog.deleteMany();
  await prisma.communicationSchedule.deleteMany();
  await prisma.communicationLog.deleteMany();
  await prisma.familyPortalToken.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.reminderRule.deleteMany();
  await prisma.revenueMismatch.deleteMany();
  await prisma.billingRecord.deleteMany();
  await prisma.carePlanChange.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.user.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.organization.deleteMany();

  // ── Organization ─────────────────────────────────────
  const org = await prisma.organization.create({
    data: { name: DEMO_ORG_NAME, type: "ASSISTED_LIVING" },
  });

  // ── Facilities ───────────────────────────────────────
  // Active occupancy targets are computed from the spec:
  //   45 beds × 89% ≈ 40 active
  //   30 beds × 93% ≈ 28 active
  //   60 beds × 85% ≈ 51 active
  //
  // Total residents per facility = bed count, with the difference between
  // bed count and active target stored as DISCHARGED so the historical
  // dataset stays interesting (admissions/discharges).
  const facilitySpecs = [
    {
      name: "Prairie Meadows Assisted Living",
      address: "1840 Prairie Way, Eden Prairie, MN 55344",
      totalBeds: 45,
      activeTarget: 40, // 89%
      mix: PRAIRIE_MEADOWS_MIX,
      addressCity: "Eden Prairie",
    },
    {
      name: "Lakeview Memory Care",
      address: "2200 Lakeview Drive, Edina, MN 55424",
      totalBeds: 30,
      activeTarget: 28, // 93%
      mix: LAKEVIEW_MEMORY_MIX,
      addressCity: "Edina",
    },
    {
      name: "Oakwood Senior Residence",
      address: "950 Oakwood Boulevard, Bloomington, MN 55425",
      totalBeds: 60,
      activeTarget: 51, // 85%
      mix: OAKWOOD_MIX,
      addressCity: "Bloomington",
    },
  ];

  const facilities = [];
  for (const spec of facilitySpecs) {
    const f = await prisma.facility.create({
      data: {
        name: spec.name,
        address: spec.address,
        totalBeds: spec.totalBeds,
        currentOccupancy: spec.activeTarget,
        organizationId: org.id,
      },
    });
    facilities.push({ ...spec, id: f.id });
  }

  // ── Admin user ───────────────────────────────────────
  const passwordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: DEMO_ADMIN_EMAIL,
      passwordHash,
      name: DEMO_ADMIN_NAME,
      role: "ADMIN",
      organizationId: org.id,
    },
  });

  // ── Residents (135 total, distributed by bed count) ──
  //
  // Per-facility plan:
  //   Prairie Meadows: 45 residents (40 active, 5 discharged)
  //   Lakeview:        30 residents (28 active, 2 discharged)
  //   Oakwood:         60 residents (51 active, 9 discharged)

  const paymentTypeOrder: PaymentType[] = (() => {
    // Build a deterministic 70/20/10 split across 135 slots.
    const slots: PaymentType[] = [];
    for (let i = 0; i < 95; i++) slots.push("PRIVATE_PAY");
    for (let i = 0; i < 27; i++) slots.push("MEDICAID_WAIVER");
    for (let i = 0; i < 13; i++) slots.push("MIXED");
    return shuffle(slots);
  })();

  let paymentSlotIndex = 0;
  let nameIndex = 0;

  type DemoResident = {
    id: string;
    firstName: string;
    lastName: string;
    facilityId: string;
    facilityName: string;
    careLevel: CareLevel;
    monthlyRate: number;
    paymentType: PaymentType;
    status: ResidentStatus;
    admissionDate: Date;
    dischargeDaysAgo: number | null;
  };

  const allResidents: DemoResident[] = [];

  for (const fac of facilities) {
    const dischargedCount = fac.totalBeds - fac.activeTarget;

    // Build a list of statuses for this facility, then shuffle so the
    // discharged residents are interleaved through the data set.
    const statuses: ResidentStatus[] = [
      ...Array(fac.activeTarget).fill("ACTIVE" as ResidentStatus),
      ...Array(dischargedCount).fill("DISCHARGED" as ResidentStatus),
    ];
    const shuffledStatuses = shuffle(statuses);

    for (let i = 0; i < fac.totalBeds; i++) {
      const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(nameIndex * 7) % LAST_NAMES.length];
      nameIndex++;

      const careLevel = pickFromMix(fac.mix);
      const monthlyRate = RATES[careLevel];
      const paymentType = paymentTypeOrder[paymentSlotIndex++];
      const status = shuffledStatuses[i];

      // Active residents: admitted 30–1100 days ago.
      // Discharged residents: admitted long ago, discharged 30–250 days ago.
      const admissionDaysAgoBase = randomInt(60, 1100);
      const admissionDaysAgo = status === "ACTIVE" ? admissionDaysAgoBase : randomInt(400, 1500);
      const dischargeDaysAgo = status === "DISCHARGED" ? randomInt(30, 250) : null;

      const contactFirstNames = [
        "Michael", "Jennifer", "David", "Sarah", "James", "Lisa",
        "Robert", "Karen", "Daniel", "Susan", "Mark", "Linda",
      ];
      const contactRelations = ["son", "daughter", "spouse", "niece", "nephew"];
      const cFirst = randomItem(contactFirstNames);
      const cRel = randomItem(contactRelations);

      const created = await prisma.resident.create({
        data: {
          firstName,
          lastName,
          facilityId: fac.id,
          roomNumber: `${randomInt(1, 3)}${String(randomInt(1, Math.max(fac.totalBeds, 30))).padStart(2, "0")}`,
          admissionDate: daysAgo(admissionDaysAgo),
          careLevel,
          monthlyRate,
          paymentType,
          status,
          contactName: `${cFirst} ${lastName} (${cRel})`,
          contactPhone: `(612) ${randomInt(200, 999)}-${String(randomInt(1000, 9999))}`,
          contactEmail: `${cFirst.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        },
      });

      allResidents.push({
        id: created.id,
        firstName,
        lastName,
        facilityId: fac.id,
        facilityName: fac.name,
        careLevel,
        monthlyRate,
        paymentType,
        status,
        admissionDate: daysAgo(admissionDaysAgo),
        dischargeDaysAgo,
      });
    }
  }

  // ── Billing history (12 months) ──────────────────────
  //
  // Pay rates by payment type:
  //   PRIVATE_PAY      → 95% paid on time, 5% partial/overdue
  //   MEDICAID_WAIVER  → 88% paid on time, 12% partial/overdue
  //   MIXED            → 91% paid on time, 9% partial/overdue
  //
  // Current month (monthsBack === 0) is always PENDING.

  const PAY_RATE: Record<PaymentType, number> = {
    PRIVATE_PAY: 0.95,
    MEDICAID_WAIVER: 0.88,
    MIXED: 0.91,
  };

  const now = new Date();
  let totalBilling = 0;

  for (const resident of allResidents) {
    for (let monthsBack = 0; monthsBack < 12; monthsBack++) {
      const billingDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      const dueDate = new Date(billingDate.getFullYear(), billingDate.getMonth(), 15);

      // Skip months before admission or after discharge.
      if (billingDate < firstOfMonth(resident.admissionDate)) continue;
      if (resident.status === "DISCHARGED" && resident.dischargeDaysAgo !== null) {
        const dischargeDate = daysAgo(resident.dischargeDaysAgo);
        if (billingDate > firstOfMonth(dischargeDate)) continue;
      }

      let paymentStatus: PaymentStatus;
      let amountPaid: number;
      let paidDate: Date | null = null;

      if (monthsBack === 0) {
        paymentStatus = "PENDING";
        amountPaid = 0;
      } else if (Math.random() < PAY_RATE[resident.paymentType]) {
        paymentStatus = "PAID";
        amountPaid = resident.monthlyRate;
        // Most pay within a few days of due date; some are slightly late.
        paidDate = new Date(dueDate.getTime() + randomInt(-3, 12) * 86400000);
      } else if (Math.random() < 0.55) {
        paymentStatus = "OVERDUE";
        amountPaid = 0;
      } else {
        paymentStatus = "PARTIAL";
        amountPaid = Math.round(resident.monthlyRate * (randomInt(30, 70) / 100));
      }

      await prisma.billingRecord.create({
        data: {
          residentId: resident.id,
          billingMonth: billingDate,
          careLevel: resident.careLevel,
          amountBilled: resident.monthlyRate,
          amountPaid,
          paymentStatus,
          dueDate,
          paidDate,
        },
      });
      totalBilling++;
    }
  }

  // ── Care plan mismatches ─────────────────────────────
  //
  // Spec: 12 mismatches totaling exactly $8,400/month in revenue leakage.
  //
  // We pick 12 active residents and assign them gaps from a fixed list that
  // sums to $8,400. Standard care-level differentials (900/1100/1300/1400)
  // can never sum to 8400 over 12 entries — so the demo uses custom rate
  // values that still feel realistic (assessment-based partial bumps).
  const MISMATCH_GAPS = [600, 600, 600, 600, 700, 700, 700, 700, 800, 800, 800, 800];
  const MISMATCH_TARGET_TOTAL = 8400;

  // Sanity check (compile-time would be nice; runtime is fine for a seed).
  const gapSum = MISMATCH_GAPS.reduce((a, b) => a + b, 0);
  if (gapSum !== MISMATCH_TARGET_TOTAL) {
    throw new Error(`Demo mismatch gaps sum to ${gapSum}, expected ${MISMATCH_TARGET_TOTAL}`);
  }

  const mismatchCandidates = shuffle(
    allResidents.filter(
      (r) => r.status === "ACTIVE" && r.careLevel !== "MEMORY_CARE",
    ),
  ).slice(0, MISMATCH_GAPS.length);

  const levelUpgrades: Record<string, CareLevel> = {
    LEVEL_1: "LEVEL_2",
    LEVEL_2: "LEVEL_3",
    LEVEL_3: "LEVEL_4",
    LEVEL_4: "MEMORY_CARE",
  };

  let mismatchCount = 0;
  let mismatchMonthlyTotal = 0;

  for (let i = 0; i < mismatchCandidates.length; i++) {
    const resident = mismatchCandidates[i];
    const gap = MISMATCH_GAPS[i];
    const newLevel = levelUpgrades[resident.careLevel];
    if (!newLevel) continue;

    const changeDaysAgo = randomInt(7, 75);
    const effectiveDate = daysAgo(changeDaysAgo);

    const carePlanChange = await prisma.carePlanChange.create({
      data: {
        residentId: resident.id,
        previousLevel: resident.careLevel,
        newLevel,
        effectiveDate,
        documentedBy: randomItem(CARE_STAFF),
      },
    });

    // Update the resident's current care level — care team did their job.
    await prisma.resident.update({
      where: { id: resident.id },
      data: { careLevel: newLevel },
    });

    // Find the billing record for the month the change took effect — that's
    // the row that still carries the OLD rate.
    const changeMonth = firstOfMonth(effectiveDate);
    const billingRecord = await prisma.billingRecord.findFirst({
      where: { residentId: resident.id, billingMonth: changeMonth },
    });
    if (!billingRecord) continue;

    const actualRate = resident.monthlyRate;
    const expectedRate = actualRate + gap;

    await prisma.revenueMismatch.create({
      data: {
        residentId: resident.id,
        facilityId: resident.facilityId,
        carePlanChangeId: carePlanChange.id,
        billingRecordId: billingRecord.id,
        expectedRate,
        actualRate,
        monthlyGap: gap,
        status: "DETECTED",
        detectedAt: new Date(),
      },
    });

    mismatchCount++;
    mismatchMonthlyTotal += gap;
  }

  // ── Reminder rules ───────────────────────────────────
  const reminderRules = [
    {
      name: "7-Day Email Reminder",
      daysOverdue: 7,
      channel: "EMAIL" as const,
      action: "SEND_REMINDER" as const,
      messageTemplate: "Dear {contact_name}, this is a friendly reminder that payment of {amount} for {resident_name}'s care at {facility_name} was due on {due_date}.",
    },
    {
      name: "14-Day SMS Follow-up",
      daysOverdue: 14,
      channel: "SMS" as const,
      action: "SEND_REMINDER" as const,
      messageTemplate: "Prairie Senior Living: Payment of {amount} for {resident_name} is 14 days overdue. Please contact billing.",
    },
    {
      name: "30-Day Phone Call",
      daysOverdue: 30,
      channel: "PHONE" as const,
      action: "ESCALATE" as const,
      messageTemplate: "Phone call scheduled to discuss overdue balance of {amount} for {resident_name}.",
    },
    {
      name: "60-Day Escalation Letter",
      daysOverdue: 60,
      channel: "LETTER" as const,
      action: "ESCALATE" as const,
      messageTemplate: "Formal notice of overdue balance for {resident_name}. Amount: {amount}. Due date: {due_date}.",
    },
    {
      name: "90-Day Collections",
      daysOverdue: 90,
      channel: "EMAIL" as const,
      action: "COLLECTIONS" as const,
      messageTemplate: "Final notice: Account for {resident_name} ({amount}) will be referred to collections if not resolved within 10 business days.",
    },
  ];

  for (const rule of reminderRules) {
    await prisma.reminderRule.create({ data: { ...rule, organizationId: org.id } });
  }

  // ── Email templates ──────────────────────────────────
  const emailTemplates = [
    {
      name: "Payment Reminder",
      subject: "Payment Reminder for {{resident_name}}'s Care",
      body: "Dear {{contact_name}},\n\nThis is a friendly reminder that a payment of {{amount_due}} for {{resident_name}}'s care at {{facility_name}} is due on {{due_date}}.\n\nView details: {{portal_link}}\n\nWarm regards,\nPrairie Senior Living Billing",
      type: "PAYMENT_REMINDER" as const,
      isDefault: true,
    },
    {
      name: "Overdue Notice",
      subject: "Important: Overdue Balance for {{resident_name}}",
      body: "Dear {{contact_name}},\n\nThe payment of {{amount_due}} for {{resident_name}}'s care at {{facility_name}} is now past due. The original due date was {{due_date}}.\n\nView account: {{portal_link}}\n\nSincerely,\nPrairie Senior Living Billing",
      type: "OVERDUE_NOTICE" as const,
      isDefault: true,
    },
    {
      name: "Payment Plan Offer",
      subject: "Payment Plan Options for {{resident_name}}'s Account",
      body: "Dear {{contact_name}},\n\nWe'd like to offer flexible payment plan options for {{resident_name}}'s outstanding balance of {{amount_due}}.\n\nVisit: {{portal_link}}\n\nBest regards,\nPrairie Senior Living",
      type: "PAYMENT_PLAN_OFFER" as const,
      isDefault: true,
    },
    {
      name: "Rate Adjustment Notification",
      subject: "Care Rate Update for {{resident_name}}",
      body: "Dear {{contact_name}},\n\nBased on the most recent care assessment, {{resident_name}}'s monthly rate at {{facility_name}} will be {{amount_due}}, effective {{due_date}}.\n\nDetails: {{portal_link}}\n\nRespectfully,\nPrairie Senior Living Care Team",
      type: "RATE_ADJUSTMENT" as const,
      isDefault: true,
    },
  ];

  for (const tmpl of emailTemplates) {
    await prisma.emailTemplate.create({ data: { ...tmpl, organizationId: org.id } });
  }

  // ── Family portal tokens (first 8 active residents) ──
  const portalResidents = allResidents.filter((r) => r.status === "ACTIVE").slice(0, 8);
  let firstToken: string | null = null;
  for (const resident of portalResidents) {
    const token = randomBytes(32).toString("hex");
    if (!firstToken) firstToken = token;
    await prisma.familyPortalToken.create({
      data: {
        token,
        residentId: resident.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ── Communication logs (sample) ──────────────────────
  const overdueRecords = await prisma.billingRecord.findMany({
    where: { paymentStatus: { in: ["OVERDUE", "PARTIAL"] } },
    include: { resident: true },
    take: 25,
  });

  for (const record of overdueRecords) {
    const dueDate = new Date(record.dueDate);
    const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / 86400000);

    if (daysOverdue >= 7) {
      await prisma.communicationLog.create({
        data: {
          residentId: record.residentId,
          billingRecordId: record.id,
          channel: "EMAIL",
          action: "SEND_REMINDER",
          subject: `Payment Reminder — $${Number(record.amountBilled).toLocaleString()} Due`,
          message: `Sent automated email reminder for invoice due ${dueDate.toISOString().split("T")[0]}.`,
          status: Math.random() < 0.8 ? "DELIVERED" : "SENT",
          sentAt: new Date(dueDate.getTime() + 7 * 86400000),
          openedAt: Math.random() < 0.65 ? new Date(dueDate.getTime() + 8 * 86400000) : null,
        },
      });
    }

    if (daysOverdue >= 14 && Math.random() < 0.6) {
      await prisma.communicationLog.create({
        data: {
          residentId: record.residentId,
          billingRecordId: record.id,
          channel: "SMS",
          action: "SEND_REMINDER",
          subject: `SMS Follow-up — $${Number(record.amountBilled).toLocaleString()}`,
          message: `Sent SMS to ${record.resident.contactPhone || "N/A"} regarding overdue balance.`,
          status: "DELIVERED",
          sentAt: new Date(dueDate.getTime() + 14 * 86400000),
        },
      });
    }
  }

  // ── Meal logs (90 days, ~18% avg waste rate) ─────────
  //
  // Per-meal generation produces a waste rate centered on 18% with a tight
  // distribution: most days fall between 14% and 22%, with occasional low
  // and high outliers. Empirically this lands the mean within ~1pt of 18%.

  const ATTENDANCE_RATE: Record<MealType, number> = {
    BREAKFAST: 0.88,
    LUNCH: 0.94,
    DINNER: 0.91,
  };
  const PREP_BUFFER: Record<MealType, number> = {
    BREAKFAST: 1.12,
    LUNCH: 1.18,
    DINNER: 1.20,
  };
  const COST_PER_MEAL: Record<MealType, number> = {
    BREAKFAST: 6.50,
    LUNCH: 8.50,
    DINNER: 9.00,
  };
  const DOW_MULTIPLIER = [0.92, 0.95, 0.97, 1.0, 1.02, 1.0, 0.96];

  const dietaryNotes = [
    "Standard, low-sodium, diabetic-friendly options",
    "Pureed and soft-food options included",
    "Gluten-free menu available",
    "Vegetarian alternatives offered",
    "Texture-modified portions for dysphagia",
    "Diabetic-friendly with sugar-free dessert",
    null,
    null,
  ];

  // Re-fetch facilities so we have currentOccupancy from the DB.
  const seededFacilities = await prisma.facility.findMany({ where: { organizationId: org.id } });

  const mealTypes: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
  let totalMealLogs = 0;
  let wasteSumPct = 0;

  for (const facility of seededFacilities) {
    for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
      const date = daysAgo(dayOffset);
      const dow = date.getDay();
      const dowMod = DOW_MULTIPLIER[dow];

      for (const mealType of mealTypes) {
        const expectedDiners = facility.currentOccupancy * ATTENDANCE_RATE[mealType] * dowMod;
        const prepBase = expectedDiners * PREP_BUFFER[mealType];
        const mealsPrepped = Math.max(1, Math.round(prepBase + randomInt(-3, 4)));

        // Waste % distribution centered on ~18%:
        //   70% normal: 14–22%
        //   15% low:    8–13%
        //   15% high:   23–30%
        const wasteRoll = Math.random();
        let wastePct: number;
        if (wasteRoll < 0.15) {
          wastePct = randomInt(8, 13) / 100;
        } else if (wasteRoll < 0.85) {
          wastePct = randomInt(14, 22) / 100;
        } else {
          wastePct = randomInt(23, 30) / 100;
        }

        const mealsWasted = Math.max(0, Math.round(mealsPrepped * wastePct));
        const mealsServed = Math.max(0, mealsPrepped - mealsWasted);

        await prisma.mealLog.create({
          data: {
            facilityId: facility.id,
            date,
            mealType,
            mealsPrepped,
            mealsServed,
            mealsWasted,
            costPerMeal: COST_PER_MEAL[mealType],
            dietaryNotes: randomItem(dietaryNotes),
            loggedBy: randomItem(KITCHEN_STAFF),
          },
        });

        totalMealLogs++;
        wasteSumPct += mealsPrepped > 0 ? mealsWasted / mealsPrepped : 0;
      }
    }
  }

  // ── Summary ──────────────────────────────────────────
  const activeResidents = allResidents.filter((r) => r.status === "ACTIVE").length;

  return {
    organizationId: org.id,
    organizationName: DEMO_ORG_NAME,
    adminEmail: DEMO_ADMIN_EMAIL,
    adminPassword: DEMO_ADMIN_PASSWORD,
    totals: {
      facilities: facilities.length,
      residents: allResidents.length,
      activeResidents,
      billingRecords: totalBilling,
      mismatches: mismatchCount,
      mismatchMonthlyTotal,
      mealLogs: totalMealLogs,
      avgWastePct: totalMealLogs > 0 ? +(wasteSumPct / totalMealLogs * 100).toFixed(1) : 0,
      sampleFamilyToken: firstToken,
    },
  };
}
