import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/products/:id — détail par id (admin, actifs ou non)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { translations: true, categories: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }
  return NextResponse.json({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  });
}

// PUT /api/products/:id — mise à jour (admin)
const translationSchema = z.object({
  language: z.enum(["FR", "EN", "AR"]),
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateSchema = z.object({
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  translations: z.array(translationSchema).min(1).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }

  const { translations, categoryIds, ...fields } = parsed.data;

  if (translations) {
    await prisma.productTranslation.deleteMany({ where: { productId: id } });
    await prisma.productTranslation.createMany({
      data: translations.map((t) => ({ ...t, productId: id })),
    });
  }
  if (categoryIds) {
    await prisma.productCategory.deleteMany({ where: { productId: id } });
    await prisma.productCategory.createMany({
      data: categoryIds.map((categoryId) => ({ productId: id, categoryId })),
    });
  }

  const product = await prisma.product.update({
    where: { id },
    data: fields,
    include: { translations: true },
  });

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  });
}

// DELETE /api/products/:id — un produit déjà commandé est désactivé, pas supprimé
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { orderItems: { take: 1 } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }
  if (existing.orderItems.length > 0) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ deactivated: true });
  }
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
