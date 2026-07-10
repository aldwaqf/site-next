import { NextResponse } from "next/server";
import { TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/admin/stats — chiffres clés du tableau de bord admin
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const successOnly = { transaction: { status: TransactionStatus.SUCCESS } };

  const [donationsCount, donationsSum, pendingDonations, ordersCount, ordersConfirmed, projects, products, users] =
    await Promise.all([
      prisma.donation.count({ where: successOnly }),
      prisma.donation.aggregate({ where: successOnly, _sum: { amount: true } }),
      prisma.donation.count({ where: { transaction: { status: TransactionStatus.PENDING } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.project.count(),
      prisma.product.count(),
      prisma.user.count(),
    ]);

  return NextResponse.json({
    donations: {
      confirmed: donationsCount,
      pending: pendingDonations,
      totalAmount: Number(donationsSum._sum?.amount ?? 0),
    },
    orders: { total: ordersCount, confirmed: ordersConfirmed },
    projects,
    products,
    users,
  });
}
