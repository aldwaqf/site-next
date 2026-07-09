import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /api/donations/me — historique des dons de l'utilisateur connecté
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const donations = await prisma.donation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      amount: true,
      currency: true,
      type: true,
      message: true,
      createdAt: true,
      project: { select: { slug: true, translations: true } },
      campaign: { select: { slug: true } },
      transaction: { select: { status: true, paymentMethod: true, paidAt: true } },
    },
  });

  return NextResponse.json(
    donations.map((d) => ({ ...d, amount: Number(d.amount) })),
  );
}
