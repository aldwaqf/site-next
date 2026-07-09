import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/products/categories — catégories de la boutique
export async function GET() {
  const categories = await prisma.category.findMany({
    include: { translations: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(categories);
}
