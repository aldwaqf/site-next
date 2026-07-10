// Seed : comptes de test pour le développement local UNIQUEMENT.
// À supprimer ou changer avant toute mise en production réelle.
// Le contenu (projets, articles, produits, campagnes) vient de l'ancien
// site via : npm run db:import
// Lancement : npm run db:seed
import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const users = [
  {
    email: "admin@waqfald.test",
    password: "Admin1234!",
    firstName: "Admin",
    lastName: "Waqf",
    role: UserRole.ADMIN,
  },
  {
    email: "donateur@waqfald.test",
    password: "Donateur1234!",
    firstName: "Awa",
    lastName: "Diop",
    role: UserRole.DONOR,
  },
];

async function main() {
  for (const { password, ...user } of users) {
    const hashed = await bcrypt.hash(password, 12);
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role, isActive: true },
      create: { ...user, password: hashed, isVerified: true },
    });
    console.log(`✓ Utilisateur : ${result.email} (${result.role})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed terminé.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
