import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ContentType, Language } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/contents — articles, pages et événements publiés
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 10));
  const type = params.get("type")?.toUpperCase();
  const lang = params.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const where = {
    isPublished: true,
    ...(type && type in ContentType ? { type: type as ContentType } : {}),
  };

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        translations: validLang ? { where: { language: validLang } } : true,
      },
    }),
    prisma.content.count({ where }),
  ]);

  return NextResponse.json({
    data: contents,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/contents — création d'un contenu (admin)
const contentTranslationSchema = z.object({
  language: z.enum(["FR", "EN", "AR"]),
  title: z.string().min(1),
  body: z.string().min(1),
  excerpt: z.string().optional(),
});

const createContentSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  type: z.enum(["ARTICLE", "PAGE", "EVENT", "TESTIMONIAL"]).default("ARTICLE"),
  featuredImage: z.string().nullable().optional(),
  isPublished: z.boolean().default(true),
  translations: z.array(contentTranslationSchema).min(1),
});

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = createContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const dto = parsed.data;

  const existing = await prisma.content.findUnique({ where: { slug: dto.slug } });
  if (existing) {
    return NextResponse.json({ error: `Un contenu avec l'adresse "${dto.slug}" existe déjà` }, { status: 409 });
  }

  const content = await prisma.content.create({
    data: {
      slug: dto.slug,
      type: dto.type,
      featuredImage: dto.featuredImage,
      isPublished: dto.isPublished,
      publishedAt: dto.isPublished ? new Date() : null,
      translations: { create: dto.translations },
    },
    include: { translations: true },
  });

  return NextResponse.json(content, { status: 201 });
}
