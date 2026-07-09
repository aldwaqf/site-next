// Seed : remplit la base avec des données de départ réalistes.
// Relançable sans risque : upsert = met à jour si le slug existe déjà.
// Lancement : npm run db:seed
import "dotenv/config";
import { PrismaClient, Language } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const projects = [
  {
    slug: "renovation-daara-thies",
    status: "ACTIVE" as const,
    goalAmount: 15_000_000,
    collectedAmount: 9_750_000,
    donorCount: 214,
    featuredImage: "/img/imgi_3_Image_fx103.jpg",
    isUrgent: true,
    isFeatured: true,
    translations: [
      { language: Language.FR, title: "Rénovation du daara de Thiès", description: "Réhabilitation complète des salles de classe et du dortoir du daara de Thiès pour accueillir 150 talibés dans de bonnes conditions.", shortDesc: "Réhabiliter les salles et le dortoir pour 150 talibés." },
      { language: Language.EN, title: "Thiès Daara Renovation", description: "Complete rehabilitation of the classrooms and dormitory of the Thiès daara to host 150 students in good conditions.", shortDesc: "Rehabilitate classrooms and dormitory for 150 students." },
      { language: Language.AR, title: "ترميم دار تيس", description: "إعادة تأهيل كاملة للفصول الدراسية والمهجع في دار تيس لاستقبال 150 طالبًا في ظروف جيدة.", shortDesc: "إعادة تأهيل الفصول والمهجع لـ150 طالبًا." },
    ],
  },
  {
    slug: "puits-eau-potable-touba",
    status: "ACTIVE" as const,
    goalAmount: 8_000_000,
    collectedAmount: 3_200_000,
    donorCount: 87,
    featuredImage: "/img/imgi_50_Image_fx90.jpg",
    isUrgent: false,
    isFeatured: true,
    translations: [
      { language: Language.FR, title: "Puits d'eau potable à Touba", description: "Forage d'un puits et installation d'un système de distribution d'eau potable pour le daara et le village voisin.", shortDesc: "Un puits pour le daara et le village." },
      { language: Language.EN, title: "Drinking Water Well in Touba", description: "Drilling a well and installing a drinking water distribution system for the daara and the neighbouring village.", shortDesc: "A well for the daara and the village." },
      { language: Language.AR, title: "بئر مياه صالحة للشرب في طوبى", description: "حفر بئر وتركيب نظام توزيع مياه صالحة للشرب للدار والقرية المجاورة.", shortDesc: "بئر للدار والقرية." },
    ],
  },
  {
    slug: "cantine-scolaire-dakar",
    status: "ACTIVE" as const,
    goalAmount: 5_000_000,
    collectedAmount: 4_650_000,
    donorCount: 156,
    featuredImage: "/img/imgi_51_Image_fx85.jpg",
    isUrgent: false,
    isFeatured: false,
    translations: [
      { language: Language.FR, title: "Cantine scolaire à Dakar", description: "Mise en place d'une cantine pour offrir deux repas par jour aux 200 talibés du daara de Dakar.", shortDesc: "Deux repas par jour pour 200 talibés." },
      { language: Language.EN, title: "School Canteen in Dakar", description: "Setting up a canteen to provide two meals a day to the 200 students of the Dakar daara.", shortDesc: "Two meals a day for 200 students." },
      { language: Language.AR, title: "مطعم مدرسي في داكار", description: "إنشاء مطعم لتقديم وجبتين يوميًا لـ200 طالب في دار داكار.", shortDesc: "وجبتان يوميًا لـ200 طالب." },
    ],
  },
];

async function main() {
  for (const { translations, ...project } of projects) {
    const result = await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: {
        ...project,
        translations: { create: translations },
      },
    });
    console.log(`✓ Projet : ${result.slug}`);
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
