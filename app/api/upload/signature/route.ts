import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

// POST /api/upload/signature — signe une demande d'upload Cloudinary.
// Principe : le navigateur envoie l'image directement à Cloudinary,
// mais Cloudinary exige une signature créée avec notre API secret.
// Le secret reste ici, côté serveur : le navigateur ne le voit jamais.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Réservé aux administrateurs" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const paramsToSign = body?.paramsToSign;
  if (!paramsToSign || typeof paramsToSign !== "object") {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return NextResponse.json({ signature });
}
