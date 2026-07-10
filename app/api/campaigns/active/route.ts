import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/campaigns/active — campagnes actives (sans pagination)
export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ isUrgent: "desc" }, { endDate: "asc" }],
    include: { translations: true },
  });

  return NextResponse.json(
    campaigns.map((c) => ({
      ...c,
      goalAmount: c.goalAmount ? Number(c.goalAmount) : null,
      collectedAmount: Number(c.collectedAmount),
    })),
  );
}
