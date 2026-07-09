// Import du contenu réel de l'ancien site (waqfald.com) vers notre base Neon.
// L'ancien backend expose une API publique en lecture : on la consomme.
// Relançable sans risque : upsert par slug. Les images restent sur le même
// compte Cloudinary, donc les URLs fonctionnent telles quelles.
// Lancement : npm run db:import
import "dotenv/config";
import { PrismaClient, Language, ContentType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const OLD_API = "https://waqfald.com/api";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Slugs des données de démo à supprimer (remplacées par le vrai contenu)
const DEMO_PROJECTS = ["renovation-daara-thies", "puits-eau-potable-touba", "cantine-scolaire-dakar"];
const DEMO_PRODUCTS = ["tshirt-waqf", "tote-bag-daara"];

type Translation = { language: string; title?: string; name?: string; description?: string; shortDesc?: string; body?: string; excerpt?: string };

async function fetchAll<T>(path: string): Promise<T[]> {
  const res = await fetch(`${OLD_API}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

function toLang(value: string): Language {
  return value.toUpperCase() as Language;
}

async function importProjects() {
  const projects = await fetchAll<{
    slug: string; status: string; goalAmount: string; collectedAmount: string;
    donorCount: number; featuredImage?: string; gallery: string[];
    isUrgent: boolean; isFeatured: boolean; startDate?: string; endDate?: string;
    translations: Translation[];
  }>("/projects?limit=100");

  for (const p of projects) {
    const data = {
      status: p.status as "ACTIVE",
      goalAmount: Number(p.goalAmount),
      collectedAmount: Number(p.collectedAmount),
      donorCount: p.donorCount,
      featuredImage: p.featuredImage,
      gallery: p.gallery ?? [],
      isUrgent: p.isUrgent,
      isFeatured: p.isFeatured,
      startDate: p.startDate ? new Date(p.startDate) : null,
      endDate: p.endDate ? new Date(p.endDate) : null,
    };
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
    // Traductions : on remplace pour rester fidèle à la source
    await prisma.projectTranslation.deleteMany({ where: { projectId: project.id } });
    await prisma.projectTranslation.createMany({
      data: p.translations.map((t) => ({
        projectId: project.id,
        language: toLang(t.language),
        title: t.title ?? "",
        description: t.description ?? "",
        shortDesc: t.shortDesc,
      })),
    });
    console.log(`✓ Projet importé : ${p.slug}`);
  }
}

async function importContents() {
  const contents = await fetchAll<{
    slug: string; type: string; featuredImage?: string; isPublished: boolean;
    publishedAt?: string; translations: Translation[];
  }>("/contents?limit=100");

  for (const c of contents) {
    const data = {
      type: c.type as ContentType,
      featuredImage: c.featuredImage,
      isPublished: c.isPublished,
      publishedAt: c.publishedAt ? new Date(c.publishedAt) : null,
    };
    const content = await prisma.content.upsert({
      where: { slug: c.slug },
      update: data,
      create: { slug: c.slug, ...data },
    });
    await prisma.contentTranslation.deleteMany({ where: { contentId: content.id } });
    await prisma.contentTranslation.createMany({
      data: c.translations.map((t) => ({
        contentId: content.id,
        language: toLang(t.language),
        title: t.title ?? "",
        body: t.body ?? "",
        excerpt: t.excerpt,
      })),
    });
    console.log(`✓ Contenu importé : ${c.type} ${c.slug.slice(0, 50)}`);
  }
}

async function importProducts() {
  const products = await fetchAll<{
    slug: string; price: string; comparePrice?: string; stock: number;
    images: string[]; isActive: boolean; isFeatured?: boolean;
    translations: Translation[];
  }>("/products?limit=100");

  for (const p of products) {
    const data = {
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      stock: p.stock,
      images: p.images ?? [],
      isActive: p.isActive,
      isFeatured: p.isFeatured ?? false,
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
    await prisma.productTranslation.deleteMany({ where: { productId: product.id } });
    await prisma.productTranslation.createMany({
      data: p.translations.map((t) => ({
        productId: product.id,
        language: toLang(t.language),
        name: t.name ?? "",
        description: t.description,
      })),
    });
    console.log(`✓ Produit importé : ${p.slug}`);
  }
}

async function importCampaigns() {
  const campaigns = await fetchAll<{
    slug: string; status: string; goalAmount?: string; collectedAmount: string;
    featuredImage?: string; startDate: string; endDate: string; isUrgent: boolean;
    translations: Translation[];
  }>("/campaigns?limit=100");

  for (const c of campaigns) {
    const data = {
      status: c.status as "ACTIVE",
      goalAmount: c.goalAmount ? Number(c.goalAmount) : null,
      collectedAmount: Number(c.collectedAmount),
      featuredImage: c.featuredImage,
      startDate: new Date(c.startDate),
      endDate: new Date(c.endDate),
      isUrgent: c.isUrgent,
    };
    const campaign = await prisma.campaign.upsert({
      where: { slug: c.slug },
      update: data,
      create: { slug: c.slug, ...data },
    });
    await prisma.campaignTranslation.deleteMany({ where: { campaignId: campaign.id } });
    await prisma.campaignTranslation.createMany({
      data: c.translations.map((t) => ({
        campaignId: campaign.id,
        language: toLang(t.language),
        title: t.title ?? "",
        description: t.description ?? "",
      })),
    });
    console.log(`✓ Campagne importée : ${c.slug}`);
  }
}

async function removeDemoData() {
  const projects = await prisma.project.deleteMany({
    where: { slug: { in: DEMO_PROJECTS }, donations: { none: {} } },
  });
  const products = await prisma.product.deleteMany({
    where: { slug: { in: DEMO_PRODUCTS }, orderItems: { none: {} } },
  });
  console.log(`✓ Démo supprimée : ${projects.count} projets, ${products.count} produits`);
}

async function main() {
  await importProjects();
  await importContents();
  await importProducts();
  await importCampaigns();
  await removeDemoData();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Import terminé.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
