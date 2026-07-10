import { NextRequest, NextResponse } from "next/server";
import { ContentType, Language } from "@prisma/client";
import { prisma } from "@/lib/db";

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
