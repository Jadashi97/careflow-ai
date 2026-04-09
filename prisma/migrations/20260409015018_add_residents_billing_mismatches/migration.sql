-- CreateEnum
CREATE TYPE "CareLevel" AS ENUM ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'MEMORY_CARE');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PRIVATE_PAY', 'MEDICAID_WAIVER', 'MIXED');

-- CreateEnum
CREATE TYPE "ResidentStatus" AS ENUM ('ACTIVE', 'DISCHARGED', 'DECEASED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'PARTIAL');

-- CreateEnum
CREATE TYPE "MismatchStatus" AS ENUM ('DETECTED', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "careLevel" "CareLevel" NOT NULL,
    "monthlyRate" DECIMAL(10,2) NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "status" "ResidentStatus" NOT NULL DEFAULT 'ACTIVE',
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarePlanChange" (
    "id" TEXT NOT NULL,
    "previousLevel" "CareLevel" NOT NULL,
    "newLevel" "CareLevel" NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "documentedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "residentId" TEXT NOT NULL,

    CONSTRAINT "CarePlanChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingRecord" (
    "id" TEXT NOT NULL,
    "billingMonth" TIMESTAMP(3) NOT NULL,
    "careLevel" "CareLevel" NOT NULL,
    "amountBilled" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "residentId" TEXT NOT NULL,

    CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueMismatch" (
    "id" TEXT NOT NULL,
    "expectedRate" DECIMAL(10,2) NOT NULL,
    "actualRate" DECIMAL(10,2) NOT NULL,
    "monthlyGap" DECIMAL(10,2) NOT NULL,
    "status" "MismatchStatus" NOT NULL DEFAULT 'DETECTED',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "residentId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "carePlanChangeId" TEXT NOT NULL,
    "billingRecordId" TEXT NOT NULL,

    CONSTRAINT "RevenueMismatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarePlanChange" ADD CONSTRAINT "CarePlanChange_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingRecord" ADD CONSTRAINT "BillingRecord_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueMismatch" ADD CONSTRAINT "RevenueMismatch_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueMismatch" ADD CONSTRAINT "RevenueMismatch_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueMismatch" ADD CONSTRAINT "RevenueMismatch_carePlanChangeId_fkey" FOREIGN KEY ("carePlanChangeId") REFERENCES "CarePlanChange"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueMismatch" ADD CONSTRAINT "RevenueMismatch_billingRecordId_fkey" FOREIGN KEY ("billingRecordId") REFERENCES "BillingRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
