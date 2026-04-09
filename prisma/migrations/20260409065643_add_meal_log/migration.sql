-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateTable
CREATE TABLE "MealLog" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealType" "MealType" NOT NULL,
    "mealsPrepped" INTEGER NOT NULL,
    "mealsServed" INTEGER NOT NULL,
    "mealsWasted" INTEGER NOT NULL,
    "costPerMeal" DECIMAL(10,2) NOT NULL DEFAULT 8.00,
    "dietaryNotes" TEXT,
    "loggedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealLog_facilityId_date_idx" ON "MealLog"("facilityId", "date");

-- CreateIndex
CREATE INDEX "MealLog_date_mealType_idx" ON "MealLog"("date", "mealType");

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
