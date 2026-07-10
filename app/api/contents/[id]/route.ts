import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/contents/:id — détail par id (admin, tous statuts)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const content = await prisma.content.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!content) {
    return NextResponse.json({ error: "Contenu non trouvé" }, { status: 404 });
  }
  return NextResponse.json(content);
}

// PUT /api/contents/:id — mise à jour (admin)
const translationSchema = z.object({
  language: z.enum(["FR", "EN", "AR"]),
  title: z.string().min(1),
  body: z.string().min(1),
  excerpt: z.string().optional(),
});

const updateSchema = z.object({
  featuredImage: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
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

  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Contenu non trouvé" }, { status: 404 });
  }

  const { translations, ...fields } = parsed.data;

  if (translations) {
    await prisma.contentTranslation.deleteMany({ where: { contentId: id } });
    await prisma.contentTranslation.createMany({
      data: translations.map((t) => ({ ...t, contentId: id })),
    });
  }

  const content = await prisma.content.update({
    where: { id },
    data: {
      ...fields,
      // Première publication : on fige la date
      publishedAt:
        fields.isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
    include: { translations: true },
  });

  return NextResponse.json(content);
}

// DELETE /api/contents/:id — suppression (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Contenu non trouvé" }, { status: 404 });
  }
  await prisma.content.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
