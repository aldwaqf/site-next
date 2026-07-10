import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/products — catalogue boutique (produits actifs)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 12));
  const lang = params.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const where = { isActive: true };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        translations: validLang ? { where: { language: validLang } } : true,
        categories: {
          include: { category: { include: { translations: true } } },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/products — création d'un produit (admin)
const productTranslationSchema = z.object({
  language: z.enum(["FR", "EN", "AR"]),
  name: z.string().min(1),
  description: z.string().optional(),
});

const createProductSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  price: z.number().positive(),
  comparePrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
  translations: z.array(productTranslationSchema).min(1),
});

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const dto = parsed.data;

  const existing = await prisma.product.findUnique({ where: { slug: dto.slug } });
  if (existing) {
    return NextResponse.json({ error: `Un produit avec l'adresse "${dto.slug}" existe déjà` }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      slug: dto.slug,
      price: dto.price,
      comparePrice: dto.comparePrice,
      stock: dto.stock,
      images: dto.images,
      isActive: dto.isActive,
      isFeatured: dto.isFeatured,
      translations: { create: dto.translations },
      categories: { create: dto.categoryIds.map((categoryId) => ({ categoryId })) },
    },
    include: { translations: true },
  });

  return NextResponse.json(
    { ...product, price: Number(product.price), comparePrice: product.comparePrice ? Number(product.comparePrice) : null },
    { status: 201 },
  );
}
