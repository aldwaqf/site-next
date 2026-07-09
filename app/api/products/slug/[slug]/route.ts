import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";

// GET /api/products/slug/:slug — fiche produit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = request.nextUrl.searchParams.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      translations: validLang ? { where: { language: validLang } } : true,
    },
  });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  });
}
