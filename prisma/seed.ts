import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.user.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.organization.deleteMany();

  // Create sample organization
  const org = await prisma.organization.create({
    data: {
      name: "Sunrise Senior Care",
      type: "ASSISTED_LIVING",
    },
  });

  // Create 3 facilities
  await prisma.facility.createMany({
    data: [
      {
        name: "Sunrise Gardens",
        address: "100 Garden Way, Austin, TX 78701",
        totalBeds: 120,
        currentOccupancy: 98,
        organizationId: org.id,
      },
      {
        name: "Sunrise Meadows",
        address: "250 Meadow Lane, Austin, TX 78702",
        totalBeds: 80,
        currentOccupancy: 72,
        organizationId: org.id,
      },
      {
        name: "Sunrise Ridge",
        address: "500 Ridge Blvd, Round Rock, TX 78664",
        totalBeds: 60,
        currentOccupancy: 45,
        organizationId: org.id,
      },
    ],
  });

  // Create admin user (password: admin123)
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

  console.log("Seed data created successfully!");
  console.log("Login with: admin@sunrisecare.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
