import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Les migrations passent par la connexion directe (sans pooler),
    // l'app utilise DATABASE_URL (avec pooler) à l'exécution.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
