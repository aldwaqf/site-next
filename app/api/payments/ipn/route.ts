import { NextRequest, NextResponse } from "next/server";
import { TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyIpnSha256 } from "@/lib/paytech";

// POST /api/payments/ipn — webhook PayTech (Instant Payment Notification).
// PayTech appelle cette route depuis SES serveurs quand un paiement aboutit
// ou est annulé. C'est ici (et seulement ici) qu'un don devient officiel.
export async function POST(request: NextRequest) {
  // PayTech envoie du JSON ou du form-encoded selon les cas : on gère les deux
  let body: Record<string, string>;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await request.json().catch(() => ({}));
  } else {
    const form = await request.formData().catch(() => null);
    body = form ? (Object.fromEntries(form.entries()) as Record<string, string>) : {};
  }

  // Authentification de la notification : sha256 de nos clés API
  const isValid = verifyIpnSha256(
    body.api_key_sha256 ?? "",
    body.api_secret_sha256 ?? "",
  );
  if (!isValid) {
    console.error(`[IPN] Signature invalide (ref: ${body.ref_command})`);
    return NextResponse.json(
      { status: "error", message: "Invalid signature" },
      { status: 401 },
    );
  }

  let customField: { type?: string; donationId?: string; orderId?: string } = {};
  try {
    customField = JSON.parse(body.custom_field || "{}");
  } catch {
    console.warn("[IPN] custom_field illisible");
  }

  if (customField.type === "donation" && customField.donationId) {
    if (body.type_event === "sale_complete") {
      await confirmDonation(customField.donationId, body.ref_command);
    } else if (body.type_event === "sale_canceled") {
      await cancelDonation(customField.donationId);
    }
  } else if (customField.type === "order" && customField.orderId) {
    if (body.type_event === "sale_complete") {
      await confirmOrder(customField.orderId, body.ref_command);
    } else if (body.type_event === "sale_canceled") {
      await cancelOrder(customField.orderId);
    }
  }

  return NextResponse.json({ status: "ok" });
}

async function confirmOrder(orderId: string, providerRef: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    console.error(`[IPN] Commande introuvable : ${orderId}`);
    return;
  }
  // Idempotence : une notification en double ne déstocke pas deux fois
  if (order.status === "CONFIRMED") {
    console.warn(`[IPN] Commande déjà confirmée : ${orderId}`);
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CONFIRMED", paidAt: new Date(), paymentRef: providerRef },
  });

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  console.info(`[IPN] Commande confirmée : ${order.orderNumber} (${Number(order.total)} XOF)`);
}

async function cancelOrder(orderId: string) {
  await prisma.order
    .update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    })
    .catch(() => console.error(`[IPN] Annulation commande impossible : ${orderId}`));
  console.info(`[IPN] Commande annulée : ${orderId}`);
}

async function confirmDonation(donationId: string, providerRef: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { transaction: true },
  });
  if (!donation) {
    console.error(`[IPN] Don introuvable : ${donationId}`);
    return;
  }
  // Idempotence : si PayTech renvoie deux fois la notification,
  // on ne compte pas le don deux fois.
  if (donation.transaction?.status === TransactionStatus.SUCCESS) {
    console.warn(`[IPN] Don déjà confirmé : ${donationId}`);
    return;
  }

  await prisma.transaction.update({
    where: { donationId },
    data: {
      status: TransactionStatus.SUCCESS,
      providerRef,
      paidAt: new Date(),
    },
  });

  if (donation.projectId) {
    await prisma.project.update({
      where: { id: donation.projectId },
      data: {
        collectedAmount: { increment: donation.amount },
        donorCount: { increment: 1 },
      },
    });
  }
  if (donation.campaignId) {
    await prisma.campaign.update({
      where: { id: donation.campaignId },
      data: { collectedAmount: { increment: donation.amount } },
    });
  }

  console.info(`[IPN] Don confirmé : ${donationId} (${Number(donation.amount)} XOF)`);
}

async function cancelDonation(donationId: string) {
  await prisma.transaction
    .update({
      where: { donationId },
      data: { status: TransactionStatus.CANCELLED },
    })
    .catch(() => console.error(`[IPN] Annulation impossible : ${donationId}`));
  console.info(`[IPN] Don annulé : ${donationId}`);
}
