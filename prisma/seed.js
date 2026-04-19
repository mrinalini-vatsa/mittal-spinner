import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@mittelspinners.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const password = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email,
        password,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
