import { defineConfig } from "drizzle-kit";

const DATABASE_URL = "postgresql://postgres:fqrouk1122@localhost:5432/internship_db";
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
