import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";
import { serializeAmounts } from "@/lib/serializers";

// GET /api/projects/slug/:slug — détail d'un projet par son slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = request.nextUrl.searchParams.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      translations: validLang ? { where: { language: validLang } } : true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
  }

  return NextResponse.json(serializeAmounts(project));
}
