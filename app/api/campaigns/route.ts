import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";

// GET /api/campaigns — campagnes en cours
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 10));
  const lang = params.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const where = { status: "ACTIVE" as const };

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isUrgent: "desc" }, { endDate: "asc" }],
      include: {
        translations: validLang ? { where: { language: validLang } } : true,
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  return NextResponse.json({
    data: campaigns.map((c) => ({
      ...c,
      goalAmount: c.goalAmount ? Number(c.goalAmount) : null,
      collectedAmount: Number(c.collectedAmount),
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
