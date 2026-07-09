import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { TransactionStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requestPayment } from "@/lib/paytech";

// POST /api/donations — créer un don et obtenir l'URL de paiement PayTech.
// OUVERT AUX VISITEURS : pas besoin de compte pour donner (décision produit).
// Si l'utilisateur est connecté, le don est rattaché à son compte.
const createDonationSchema = z.object({
  amount: z.number().min(100, "Montant minimum : 100 FCFA"),
  paymentMethod: z.enum(["WAVE", "ORANGE_MONEY", "FREE_MONEY", "VISA", "MASTERCARD"]),
  type: z.enum(["ONE_TIME", "MONTHLY"]).optional(),
  projectId: z.string().optional(),
  campaignId: z.string().optional(),
  donorName: z.string().max(200).optional(),
  donorEmail: z.string().email().optional(),
  donorPhone: z.string().max(30).optional(),
  isAnonymous: z.boolean().optional(),
  message: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createDonationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }
  const dto = parsed.data;

  // Session facultative : un visiteur non connecté peut donner
  const session = await auth();
  const userId = session?.user?.id;

  if (dto.projectId) {
    const project = await prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }
  }
  if (dto.campaignId) {
    const campaign = await prisma.campaign.findUnique({ where: { id: dto.campaignId } });
    if (!campaign) {
      return NextResponse.json({ error: "Campagne non trouvée" }, { status: 404 });
    }
  }

  const externalId = `DON-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  const donation = await prisma.donation.create({
    data: {
      amount: dto.amount,
      currency: "XOF",
      type: dto.type ?? "ONE_TIME",
      donorName: dto.donorName,
      donorEmail: dto.donorEmail,
      donorPhone: dto.donorPhone,
      isAnonymous: dto.isAnonymous ?? false,
      message: dto.message,
      projectId: dto.projectId,
      campaignId: dto.campaignId,
      userId,
      transaction: {
        create: {
          externalId,
          amount: dto.amount,
          currency: "XOF",
          paymentMethod: dto.paymentMethod,
          status: TransactionStatus.PENDING,
          userId,
        },
      },
    },
    include: { transaction: true },
  });

  const paytechResponse = await requestPayment({
    itemName: `Don Waqf - ${externalId}`,
    amount: dto.amount,
    refCommand: externalId,
    commandName: `Don de ${dto.donorName || "Anonyme"} - Waqf And Liggeyal Daara`,
    paymentMethod: dto.paymentMethod,
    customField: {
      type: "donation",
      donationId: donation.id,
      userId: userId ?? null,
    },
  });

  return NextResponse.json(
    {
      donation: { id: donation.id, amount: Number(donation.amount) },
      paymentData: {
        checkoutUrl: paytechResponse.redirect_url || paytechResponse.redirectUrl,
        token: paytechResponse.token,
        reference: externalId,
        success: paytechResponse.success === 1,
      },
    },
    { status: 201 },
  );
}

// GET /api/donations — dons confirmés, anonymisés si demandé (public)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 10));
  const projectId = params.get("projectId") ?? undefined;

  const where = {
    transaction: { status: TransactionStatus.SUCCESS },
    ...(projectId ? { projectId } : {}),
  };

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        currency: true,
        type: true,
        donorName: true,
        isAnonymous: true,
        message: true,
        createdAt: true,
        project: { select: { id: true, slug: true } },
        campaign: { select: { id: true, slug: true } },
      },
    }),
    prisma.donation.count({ where }),
  ]);

  return NextResponse.json({
    data: donations.map((d) => ({
      ...d,
      amount: Number(d.amount),
      donorName: d.isAnonymous ? "Anonyme" : d.donorName,
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
