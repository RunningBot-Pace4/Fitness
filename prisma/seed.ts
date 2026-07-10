import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const centerKey = process.env.SEED_CENTER_KEY ?? "FITNESS2026";
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const center = await prisma.fitnessCenter.upsert({
    where: { centerKey },
    update: {},
    create: {
      name: "Pulse Fitness Center",
      centerKey
    }
  });

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
      fitnessCenterId: center.id
    },
    create: {
      name: "Fitness Admin",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
      fitnessCenterId: center.id
    }
  });

  console.log("Seed completed.");
  console.log(`Center key: ${centerKey}`);
  console.log(`Admin email: ${adminEmail}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
