import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Garde commun des routes admin : renvoie null si OK,
// sinon la réponse d'erreur à retourner telle quelle.
export async function requireAdmin(): Promise<NextResponse | null> {
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
  return null;
}
