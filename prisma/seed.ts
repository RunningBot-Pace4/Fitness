import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminKeyFob = process.env.SEED_ADMIN_KEY_FOB ?? "ADMIN-FOB-001";

  const center = await prisma.fitnessCenter.upsert({
    where: { slug: "pulse-fitness" },
    update: {},
    create: {
      name: "Pulse Fitness Center",
      slug: "pulse-fitness"
    }
  });

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      keyFob: adminKeyFob,
      membershipType: "MEMBER",
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
      fitnessCenterId: center.id
    },
    create: {
      name: "Fitness Admin",
      email: adminEmail,
      passwordHash,
      keyFob: adminKeyFob,
      membershipType: "MEMBER",
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
      fitnessCenterId: center.id
    }
  });

  console.log("Seed completed.");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin key fob: ${adminKeyFob}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
