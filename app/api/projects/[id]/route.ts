import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";
import { serializeAmounts } from "@/lib/serializers";

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
