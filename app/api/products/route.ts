import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";
import { prisma } from "@/lib/db";

// GET /api/products — catalogue boutique (produits actifs)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 12));
  const lang = params.get("lang")?.toUpperCase();
  const validLang = lang && lang in Language ? (lang as Language) : undefined;

  const where = { isActive: true };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        translations: validLang ? { where: { language: validLang } } : true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
