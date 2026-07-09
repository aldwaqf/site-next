// Augmentation de types : on enrichit la session Auth.js
// avec nos champs métier (id, role, prénom, nom).
import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      role: string;
      firstName?: string;
      lastName?: string;
    };
  }
}
