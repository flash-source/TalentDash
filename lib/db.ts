import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 4,
  delayMs = 1500
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const msg = String(err);
      const isConnectionErr =
        msg.includes("Can't reach database") ||
        msg.includes("Connection refused") ||
        msg.includes("kind: Closed") ||
        msg.includes("connection pool") ||
        msg.includes("ECONNREFUSED");

      if (isConnectionErr && attempt < retries) {
        console.warn(`[DB] Connection attempt ${attempt} failed, retrying in ${delayMs}ms…`);
        await new Promise((r) => setTimeout(r, delayMs * attempt)); // backoff
        // Force reconnect
        try { await prisma.$disconnect(); } catch {}
        continue;
      }
      throw err;
    }
  }
  throw new Error("DB retry exhausted");
}