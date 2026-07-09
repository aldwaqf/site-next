import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Language, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { serializeAmounts } from "@/lib/serializers";

// GET /api/projects — liste paginée avec filtres
// Reprend la logique de findAll() du ProjectsService NestJS original.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 10));
  const lang = params.get("lang")?.toUpperCase();
  const status = params.get("status")?.toUpperCase();
  const isUrgent = params.get("isUrgent");
  const isFeatured = params.get("isFeatured");

  const where: {
    status?: ProjectStatus;
    isUrgent?: boolean;
    isFeatured?: boolean;
  } = {};

  if (status && status in ProjectStatus) {
    where.status = status as ProjectStatus;
  }
  if (isUrgent !== null) where.isUrgent = isUrgent === "true";
  if (isFeatured !== null) where.isFeatured = isFeatured === "true";

  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { isUrgent: "desc" },
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        translations: validLang ? { where: { language: validLang } } : true,
      },
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({
    data: projects.map(serializeAmounts),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/projects — création d'un projet
// ⚠️ Sera réservé aux admins à l'Étape 5 (auth).
const translationSchema = z.object({
  language: z.enum(["FR", "EN", "AR"]),
  title: z.string().min(1),
  description: z.string().min(1),
  shortDesc: z.string().optional(),
});

const createProjectSchema = z.object({
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "slug en minuscules, chiffres et tirets uniquement"),
  goalAmount: z.number().positive(),
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  isUrgent: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  translations: z.array(translationSchema).min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const dto = parsed.data;

  const existing = await prisma.project.findUnique({
    where: { slug: dto.slug },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Un projet avec le slug "${dto.slug}" existe déjà` },
      { status: 409 },
    );
  }

  const project = await prisma.project.create({
    data: {
      slug: dto.slug,
      goalAmount: dto.goalAmount,
      featuredImage: dto.featuredImage,
      gallery: dto.gallery ?? [],
      isUrgent: dto.isUrgent ?? false,
      isFeatured: dto.isFeatured ?? false,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      translations: {
        create: dto.translations,
      },
    },
    include: {
      translations: true,
    },
  });

  return NextResponse.json(serializeAmounts(project), { status: 201 });
}
