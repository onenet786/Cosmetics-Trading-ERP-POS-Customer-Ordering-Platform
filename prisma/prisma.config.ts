// prisma/prisma.config.ts
import * as fs from "fs";
import * as path from "path";

export function getDatabaseUrl(): string {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env file not found. Ensure DATABASE_URL is set in environment.");
  }
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/^DATABASE_URL\s*=\s*(.+)$/m);
  if (!match) {
    throw new Error("DATABASE_URL not defined in .env");
  }
  return match[1].trim();
}
