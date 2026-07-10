import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/admin/donations — tous les dons (tous statuts), vue admin
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 25));

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        transaction: { select: { status: true, paymentMethod: true, paidAt: true, externalId: true } },
        project: { select: { slug: true } },
        campaign: { select: { slug: true } },
        user: { select: { email: true } },
      },
    }),
    prisma.donation.count(),
  ]);

  return NextResponse.json({
    data: donations.map((d) => ({ ...d, amount: Number(d.amount) })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
