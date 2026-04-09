import "dotenv/config";
import { PrismaClient, CareLevel, PaymentType, ResidentStatus, PaymentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
// Prisma accepts plain numbers for Decimal fields in create/update

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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

// Monthly rates by care level
const RATES: Record<CareLevel, number> = {
  LEVEL_1: 4200,
  LEVEL_2: 5100,
  LEVEL_3: 6400,
  LEVEL_4: 7800,
  MEMORY_CARE: 8900,
};

// Realistic first and last names
const FIRST_NAMES = [
  "Margaret", "Dorothy", "Helen", "Betty", "Virginia", "Ruth", "Frances",
  "Mildred", "Eleanor", "Evelyn", "Alice", "Gladys", "Edna", "Josephine",
  "Robert", "James", "William", "Charles", "George", "Donald", "Richard",
  "Thomas", "Harold", "Arthur", "Frank", "Raymond", "Edward", "Walter",
  "Henry", "Albert", "Eugene", "Gerald", "Lawrence", "Clarence", "Earl",
  "Florence", "Lucille", "Irene", "Pauline", "Lorraine", "Shirley",
  "Patricia", "Barbara", "Nancy", "Jean", "Doris", "Norma", "Delores",
  "Bernice", "Hazel", "Gertrude", "Lillian", "Thelma", "Maxine", "Ruby",
  "Grace", "Pearl", "Martha", "Lois", "Catherine",
];

const LAST_NAMES = [
  "Anderson", "Baker", "Campbell", "Davis", "Edwards", "Fischer", "Garcia",
  "Harrison", "Ingram", "Johnson", "Klein", "Larson", "Mitchell", "Nelson",
  "O'Brien", "Patterson", "Quinn", "Ramirez", "Sullivan", "Thompson",
  "Underwood", "Vasquez", "Williams", "Young", "Zimmerman", "Bennett",
  "Crawford", "Dawson", "Foster", "Gonzales", "Henderson", "Jenkins",
  "Kowalski", "Lambert", "Morrison", "Norton", "Olsen", "Price", "Reynolds",
  "Schneider", "Taylor", "Upton", "Valdez", "Watkins", "Yates", "Brooks",
  "Chapman", "Donovan", "Elliott", "Franklin", "Gibson", "Hoffman", "Irving",
  "Jacobs", "Keller", "Lawson", "Mendez", "Newman", "Ortiz", "Palmer",
];

const CARE_STAFF = [
  "Dr. Maria Santos", "RN Lisa Chen", "RN James Okafor",
  "Dr. Robert Kim", "LPN Amy Torres", "RN David Patel",
  "Dr. Susan Wright", "RN Karen Foster", "LPN Michael Cruz",
];

// ── Main Seed ──────────────────────────────────────────

async function main() {
  console.log("Cleaning existing data...");
  await prisma.communicationLog.deleteMany();
  await prisma.reminderRule.deleteMany();
  await prisma.revenueMismatch.deleteMany();
  await prisma.billingRecord.deleteMany();
  await prisma.carePlanChange.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.user.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.organization.deleteMany();

  // ── Organization ───────────────────────────────────

  console.log("Creating organization...");
  const org = await prisma.organization.create({
    data: { name: "Sunrise Senior Care", type: "ASSISTED_LIVING" },
  });

  // ── Facilities ─────────────────────────────────────

  console.log("Creating facilities...");
  const facilityData = [
    { name: "Sunrise Gardens", address: "100 Garden Way, Austin, TX 78701", totalBeds: 120, currentOccupancy: 0 },
    { name: "Sunrise Meadows", address: "250 Meadow Lane, Austin, TX 78702", totalBeds: 80, currentOccupancy: 0 },
    { name: "Sunrise Ridge", address: "500 Ridge Blvd, Round Rock, TX 78664", totalBeds: 60, currentOccupancy: 0 },
  ];

  const facilities = [];
  for (const fd of facilityData) {
    const f = await prisma.facility.create({
      data: { ...fd, organizationId: org.id },
    });
    facilities.push(f);
  }

  // ── Admin User ─────────────────────────────────────

  console.log("Creating admin user...");
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@sunrisecare.com",
      passwordHash,
      name: "Sarah Johnson",
      role: "ADMIN",
      organizationId: org.id,
    },
  });

  // ── 60 Residents ───────────────────────────────────

  console.log("Creating 60 residents across 3 facilities...");

  // Distribute: ~25 at Gardens, ~20 at Meadows, ~15 at Ridge
  const distribution = [
    { facility: facilities[0], count: 25 },
    { facility: facilities[1], count: 20 },
    { facility: facilities[2], count: 15 },
  ];

  const careLevels: CareLevel[] = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "MEMORY_CARE"];
  const paymentTypes: PaymentType[] = ["PRIVATE_PAY", "MEDICAID_WAIVER", "MIXED"];

  const allResidents: Array<{
    id: string;
    firstName: string;
    lastName: string;
    facilityId: string;
    careLevel: CareLevel;
    monthlyRate: number;
  }> = [];

  let nameIndex = 0;
  for (const { facility, count } of distribution) {
    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
      const lastName = LAST_NAMES[nameIndex % LAST_NAMES.length];
      nameIndex++;

      const careLevel = randomItem(careLevels);
      const monthlyRate = RATES[careLevel];
      const admissionDaysAgo = randomInt(30, 1200);
      const status: ResidentStatus = admissionDaysAgo > 900 && Math.random() < 0.05 ? "DISCHARGED" : "ACTIVE";

      const contactFirstNames = ["Michael", "Jennifer", "David", "Sarah", "James", "Lisa", "Robert", "Karen"];
      const contactRelation = ["son", "daughter", "spouse", "niece", "nephew"];
      const cFirst = randomItem(contactFirstNames);
      const cRel = randomItem(contactRelation);

      const resident = await prisma.resident.create({
        data: {
          firstName,
          lastName,
          facilityId: facility.id,
          roomNumber: `${randomInt(1, 3)}${String(randomInt(1, 30)).padStart(2, "0")}`,
          admissionDate: daysAgo(admissionDaysAgo),
          careLevel,
          monthlyRate: (monthlyRate),
          paymentType: randomItem(paymentTypes),
          status,
          contactName: `${cFirst} ${lastName} (${cRel})`,
          contactPhone: `(512) ${randomInt(200, 999)}-${String(randomInt(1000, 9999))}`,
          contactEmail: `${cFirst.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        },
      });

      allResidents.push({
        id: resident.id,
        firstName,
        lastName,
        facilityId: facility.id,
        careLevel,
        monthlyRate,
      });
    }

    // Update facility occupancy
    await prisma.facility.update({
      where: { id: facility.id },
      data: { currentOccupancy: count },
    });
  }

  // ── Billing Records (past 6 months for every resident) ──

  console.log("Creating billing records for past 6 months...");

  const now = new Date();
  for (const resident of allResidents) {
    for (let monthsBack = 0; monthsBack < 6; monthsBack++) {
      const billingDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      const dueDate = new Date(billingDate.getFullYear(), billingDate.getMonth(), 15);

      // Recent months may still be pending
      const isPast = monthsBack >= 1;
      let paymentStatus: PaymentStatus;
      let amountPaid: number;
      let paidDate: Date | null = null;

      if (monthsBack === 0) {
        paymentStatus = "PENDING";
        amountPaid = 0;
      } else if (isPast && Math.random() < 0.85) {
        paymentStatus = "PAID";
        amountPaid = resident.monthlyRate;
        paidDate = new Date(dueDate.getTime() + randomInt(-5, 10) * 86400000);
      } else if (Math.random() < 0.5) {
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
          amountBilled: (resident.monthlyRate),
          amountPaid: (amountPaid),
          paymentStatus,
          dueDate,
          paidDate,
        },
      });
    }
  }

  // ── Care Plan Changes with Billing Mismatches ──────

  console.log("Creating care plan changes with billing mismatches...");

  // Select 9 residents who will have care level changes in the past 90 days
  // but their billing records still reflect the OLD care level = revenue gap
  const mismatchCandidates = allResidents
    .filter((r) => r.careLevel !== "MEMORY_CARE") // can't upgrade from MEMORY_CARE
    .sort(() => Math.random() - 0.5)
    .slice(0, 9);

  const levelUpgrades: Record<string, CareLevel> = {
    LEVEL_1: "LEVEL_2",
    LEVEL_2: "LEVEL_3",
    LEVEL_3: "LEVEL_4",
    LEVEL_4: "MEMORY_CARE",
  };

  let mismatchCount = 0;
  for (const resident of mismatchCandidates) {
    const newLevel = levelUpgrades[resident.careLevel];
    if (!newLevel) continue;

    const changeDaysAgo = randomInt(7, 85); // within last 90 days
    const effectiveDate = daysAgo(changeDaysAgo);

    // Create the care plan change
    const carePlanChange = await prisma.carePlanChange.create({
      data: {
        residentId: resident.id,
        previousLevel: resident.careLevel,
        newLevel,
        effectiveDate,
        documentedBy: randomItem(CARE_STAFF),
      },
    });

    // Update the resident's current care level (care team did their job)
    await prisma.resident.update({
      where: { id: resident.id },
      data: { careLevel: newLevel },
    });

    // Find the billing record for the month the change happened
    // This billing record still has the OLD rate — that's the mismatch
    const changeMonth = firstOfMonth(effectiveDate);
    const billingRecord = await prisma.billingRecord.findFirst({
      where: {
        residentId: resident.id,
        billingMonth: changeMonth,
      },
    });

    if (!billingRecord) continue;

    const expectedRate = RATES[newLevel];
    const actualRate = resident.monthlyRate; // still billed at old rate
    const monthlyGap = expectedRate - actualRate;

    // Create the revenue mismatch record
    await prisma.revenueMismatch.create({
      data: {
        residentId: resident.id,
        facilityId: resident.facilityId,
        carePlanChangeId: carePlanChange.id,
        billingRecordId: billingRecord.id,
        expectedRate: (expectedRate),
        actualRate: (actualRate),
        monthlyGap: (monthlyGap),
        status: "DETECTED",
        detectedAt: new Date(),
      },
    });

    mismatchCount++;
    console.log(
      `  Mismatch #${mismatchCount}: ${resident.firstName} ${resident.lastName} — ` +
      `${resident.careLevel} → ${newLevel} — gap: $${monthlyGap}/mo`
    );
  }

  // ── Also create some normal (non-mismatch) care plan changes ──

  console.log("Creating additional routine care plan changes...");

  const routineCandidates = allResidents
    .filter((r) => !mismatchCandidates.includes(r) && r.careLevel !== "LEVEL_1")
    .sort(() => Math.random() - 0.5)
    .slice(0, 12);

  const levelDowngrades: Record<string, CareLevel> = {
    LEVEL_2: "LEVEL_1",
    LEVEL_3: "LEVEL_2",
    LEVEL_4: "LEVEL_3",
    MEMORY_CARE: "LEVEL_4",
  };

  for (const resident of routineCandidates) {
    const changeDaysAgo = randomInt(100, 350);
    const goingUp = Math.random() < 0.6;
    const newLevel = goingUp
      ? levelUpgrades[resident.careLevel] || resident.careLevel
      : levelDowngrades[resident.careLevel] || resident.careLevel;

    if (newLevel === resident.careLevel) continue;

    await prisma.carePlanChange.create({
      data: {
        residentId: resident.id,
        previousLevel: resident.careLevel,
        newLevel,
        effectiveDate: daysAgo(changeDaysAgo),
        documentedBy: randomItem(CARE_STAFF),
      },
    });
  }

  // ── Default Reminder Rules ──────────────────────────

  console.log("Creating default reminder rules...");
  await prisma.reminderRule.deleteMany();

  const reminderRules = [
    { name: "7-Day Email Reminder", daysOverdue: 7, channel: "EMAIL" as const, action: "SEND_REMINDER" as const, messageTemplate: "Dear {contact_name}, this is a friendly reminder that payment of {amount} for {resident_name}'s care at {facility_name} was due on {due_date}. Please remit payment at your earliest convenience." },
    { name: "14-Day SMS Follow-up", daysOverdue: 14, channel: "SMS" as const, action: "SEND_REMINDER" as const, messageTemplate: "Sunrise Senior Care: Payment of {amount} for {resident_name} is 14 days overdue. Please contact billing at (512) 555-0100." },
    { name: "30-Day Phone Call", daysOverdue: 30, channel: "PHONE" as const, action: "ESCALATE" as const, messageTemplate: "Phone call scheduled to discuss overdue balance of {amount} for {resident_name}." },
    { name: "60-Day Escalation Letter", daysOverdue: 60, channel: "LETTER" as const, action: "ESCALATE" as const, messageTemplate: "Formal notice of overdue balance for {resident_name}. Amount: {amount}. Due date: {due_date}. Please contact us immediately." },
    { name: "90-Day Collections", daysOverdue: 90, channel: "EMAIL" as const, action: "COLLECTIONS" as const, messageTemplate: "Final notice: Account for {resident_name} ({amount}) will be referred to collections if not resolved within 10 business days." },
  ];

  for (const rule of reminderRules) {
    await prisma.reminderRule.create({
      data: { ...rule, organizationId: org.id },
    });
  }

  // ── Communication Log (sample entries for overdue invoices) ──

  console.log("Creating sample communication logs...");

  const overdueRecords = await prisma.billingRecord.findMany({
    where: { paymentStatus: { in: ["OVERDUE", "PARTIAL"] } },
    include: { resident: true },
    take: 15,
  });

  const commSubjects = [
    "Payment Reminder — {amount} Due",
    "Overdue Balance Notice",
    "Follow-up: Outstanding Payment",
    "Second Notice: Payment Required",
  ];

  for (const record of overdueRecords) {
    const dueDate = new Date(record.dueDate);
    const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // First reminder at ~7 days
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
        },
      });
    }

    // Second reminder at ~14 days
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

    // Escalation at ~30 days
    if (daysOverdue >= 30 && Math.random() < 0.3) {
      await prisma.communicationLog.create({
        data: {
          residentId: record.residentId,
          billingRecordId: record.id,
          channel: "PHONE",
          action: "ESCALATE",
          subject: `Phone Escalation — ${record.resident.firstName} ${record.resident.lastName}`,
          message: `Called ${record.resident.contactName || "family contact"} regarding overdue balance. Left voicemail.`,
          status: "SENT",
          sentAt: new Date(dueDate.getTime() + 30 * 86400000),
        },
      });
    }
  }

  // ── Summary ────────────────────────────────────────

  const totalResidents = await prisma.resident.count();
  const totalBilling = await prisma.billingRecord.count();
  const totalChanges = await prisma.carePlanChange.count();
  const totalMismatches = await prisma.revenueMismatch.count();
  const totalRules = await prisma.reminderRule.count();
  const totalComms = await prisma.communicationLog.count();

  console.log("\n✅ Seed complete!");
  console.log(`   Residents:           ${totalResidents}`);
  console.log(`   Billing records:     ${totalBilling}`);
  console.log(`   Care plan changes:   ${totalChanges}`);
  console.log(`   Revenue mismatches:  ${totalMismatches}`);
  console.log(`   Reminder rules:      ${totalRules}`);
  console.log(`   Communication logs:  ${totalComms}`);
  console.log(`\n   Login: admin@sunrisecare.com / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
