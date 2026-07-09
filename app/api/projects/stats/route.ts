import { NextResponse } from "next/server";
import { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

// GET /api/projects/stats — statistiques globales des projets
export async function GET() {
  const [total, active, urgent, totalCollected] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: ProjectStatus.ACTIVE } }),
    prisma.project.count({
      where: { isUrgent: true, status: ProjectStatus.ACTIVE },
    }),
    prisma.project.aggregate({
      _sum: { collectedAmount: true },
    }),
  ]);

  return NextResponse.json({
    total,
    active,
    urgent,
    totalCollected: Number(totalCollected._sum.collectedAmount ?? 0),
  });
}
