import { defineConfig } from "drizzle-kit";

if (!process.env.DIRECT_URL) {
  throw new Error(
    "DIRECT_URL is not set. Add Supabase Direct connection (port 5432) as DIRECT_URL in .env.local / Vercel Env so drizzle-kit can migrate."
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL,
  },
});
