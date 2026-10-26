import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const transient =
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          ["P1008", "P2034"].includes(error.code)) ||
        (error instanceof Error && /SQLITE_BUSY|database is locked/i.test(error.message));
      if (!transient || attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 40 * 2 ** (attempt - 1)));
    }
  }
  throw new Error("Database operation exceeded retry limit.");
}
