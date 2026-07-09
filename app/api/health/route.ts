import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/health — diagnostic : présence des variables d'env (booléens
// uniquement, jamais les valeurs) et test de connexion à la base.
export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET),
    PAYTECH_API_KEY: Boolean(process.env.PAYTECH_API_KEY),
    PAYTECH_ENV: process.env.PAYTECH_ENV ?? null,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? null,
  };

  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    db = error instanceof Error ? error.message.slice(0, 300) : "erreur inconnue";
  }

  return NextResponse.json({ env, db });
}
