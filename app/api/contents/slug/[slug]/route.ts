import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";

// GET /api/contents/slug/:slug — détail d'un article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = request.nextUrl.searchParams.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const content = await prisma.content.findUnique({
    where: { slug },
    include: {
      translations: validLang ? { where: { language: validLang } } : true,
    },
  });

  if (!content || !content.isPublished) {
    return NextResponse.json({ error: "Contenu non trouvé" }, { status: 404 });
  }

  return NextResponse.json(content);
}
