import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requestPayment } from "@/lib/paytech";

// POST /api/orders — commande boutique, ouverte aux visiteurs (comme les dons).
// Le total est TOUJOURS recalculé côté serveur depuis les prix en base :
// on ne fait jamais confiance à un montant envoyé par le navigateur.
const createOrderSchema = z.object({
  customerName: z.string().min(2).max(200),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(30).optional(),
  shippingAddress: z.string().max(500).optional(),
  paymentMethod: z.enum(["WAVE", "ORANGE_MONEY", "FREE_MONEY", "VISA", "MASTERCARD"]).optional(),
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(50) }))
    .min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }
  const dto = parsed.data;

  const session = await auth();
  const userId = session?.user?.id;

  const products = await prisma.product.findMany({
    where: { id: { in: dto.items.map((i) => i.productId) }, isActive: true },
  });

  const orderItems: { productId: string; quantity: number; price: number }[] = [];
  for (const item of dto.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Produit introuvable : ${item.productId}` },
        { status: 404 },
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuffisant pour ce produit` },
        { status: 409 },
      );
    }
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: Number(product.price),
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const orderNumber = `CMD-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      subtotal,
      total: subtotal,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      shippingAddress: dto.shippingAddress,
      userId,
      items: { create: orderItems },
    },
  });

  const paytechResponse = await requestPayment({
    itemName: `Boutique Waqf - ${orderNumber}`,
    amount: subtotal,
    refCommand: orderNumber,
    commandName: `Commande de ${dto.customerName} - Waqf And Liggeyal Daara`,
    paymentMethod: dto.paymentMethod,
    customField: { type: "order", orderId: order.id },
  });

  return NextResponse.json(
    {
      order: { id: order.id, orderNumber, total: subtotal },
      paymentData: {
        checkoutUrl: paytechResponse.redirect_url || paytechResponse.redirectUrl,
        token: paytechResponse.token,
        reference: orderNumber,
        success: paytechResponse.success === 1,
      },
    },
    { status: 201 },
  );
}
