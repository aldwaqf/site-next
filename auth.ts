import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// Configuration Auth.js : connexion par email + mot de passe.
// La session vit dans un cookie httpOnly signé (stratégie JWT),
// pas besoin de table Session en base.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        identifier: {},
        password: {},
      },
      async authorize(credentials) {
        const identifier = (credentials?.identifier as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        // Connexion par email OU numéro de téléphone, comme l'original
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier.toLowerCase() }, { phone: identifier }],
          },
        });
        if (!user || !user.isActive) return null;

        const passwordOk = await bcrypt.compare(password, user.password);
        if (!passwordOk) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Ce qu'on retourne ici alimente le token JWT (callback jwt)
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Le token JWT est créé à la connexion puis relu à chaque requête :
    // on y range l'id et le rôle pour les retrouver sans requête DB.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    // La session est ce que voit le code applicatif (useSession, auth()).
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
      }
      return session;
    },
  },
});
