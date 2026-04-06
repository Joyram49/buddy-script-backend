import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7 config supports only `url` here.
    // Point CLI schema operations to DIRECT_URL (port 5432) for Supabase.
    url: env("DIRECT_URL"),
  },
});
