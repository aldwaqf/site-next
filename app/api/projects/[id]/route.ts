import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";
import { serializeAmounts } from "@/lib/serializers";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/projects/:id — détail d'un projet avec ses derniers dons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lang = request.nextUrl.searchParams.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      translations: validLang ? { where: { language: validLang } } : true,
      donations: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          donorName: true,
          isAnonymous: true,
          createdAt: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
  }

  return NextResponse.json(serializeAmounts(project));
}

// PUT /api/projects/:id — mise à jour d'un projet (admin)
const updateTranslationSchema = z.object({
  language: z.enum(["FR", "EN", "AR"]),
  title: z.string().min(1),
  description: z.string().min(1),
  shortDesc: z.string().optional(),
});

const updateProjectSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "SUSPENDED", "ARCHIVED"]).optional(),
  goalAmount: z.number().positive().optional(),
  featuredImage: z.string().nullable().optional(),
  gallery: z.array(z.string()).optional(),
  isUrgent: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  translations: z.array(updateTranslationSchema).min(1).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
  }

  const { translations, ...fields } = parsed.data;

  // Comme dans le backend original : on remplace les traductions fournies
  if (translations) {
    await prisma.projectTranslation.deleteMany({ where: { projectId: id } });
    await prisma.projectTranslation.createMany({
      data: translations.map((t) => ({ ...t, projectId: id })),
    });
  }

  const project = await prisma.project.update({
    where: { id },
    data: fields,
    include: { translations: true },
  });

  return NextResponse.json(serializeAmounts(project));
}

// DELETE /api/projects/:id — suppression (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.project.findUnique({
    where: { id },
    include: { donations: { take: 1 } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
  }
  // Un projet qui a reçu des dons ne se supprime pas : on l'archive
  if (existing.donations.length > 0) {
    const archived = await prisma.project.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: { translations: true },
    });
    return NextResponse.json({ archived: true, project: serializeAmounts(archived) });
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
