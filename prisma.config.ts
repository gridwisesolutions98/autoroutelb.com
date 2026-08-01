import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use process.env directly (not the env() helper) so commands that don't need
    // a real connection, like `prisma generate`, don't fail when it's unset.
    url: process.env.DATABASE_URL,
  },
});