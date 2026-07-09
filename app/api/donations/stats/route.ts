import { NextResponse } from "next/server";
import { TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

// GET /api/donations/stats — statistiques des dons confirmés
// (utilisé par la page d'accueil pour la section chiffres clés)
export async function GET() {
  const successOnly = { transaction: { status: TransactionStatus.SUCCESS } };

  const [totalDonations, totalAmount, donorGroups, projects, campaigns] =
    await Promise.all([
      prisma.donation.count({ where: successOnly }),
      prisma.donation.aggregate({ where: successOnly, _sum: { amount: true } }),
      prisma.donation.groupBy({
        by: ["donorEmail"],
        where: { ...successOnly, donorEmail: { not: null } },
      }),
      prisma.project.count(),
      prisma.campaign.count(),
    ]);

  return NextResponse.json({
    totalDonations,
    totalAmount: Number(totalAmount._sum?.amount ?? 0),
    totalDonors: donorGroups.length,
    uniqueDonors: donorGroups.length,
    totalProjects: projects,
    totalCampaigns: campaigns,
  });
}
