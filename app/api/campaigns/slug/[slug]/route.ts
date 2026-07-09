import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";

// GET /api/campaigns/slug/:slug — détail d'une campagne
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = request.nextUrl.searchParams.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      translations: validLang ? { where: { language: validLang } } : true,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campagne non trouvée" }, { status: 404 });
  }

  return NextResponse.json({
    ...campaign,
    goalAmount: campaign.goalAmount ? Number(campaign.goalAmount) : null,
    collectedAmount: Number(campaign.collectedAmount),
  });
}
