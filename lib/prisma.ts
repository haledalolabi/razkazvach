import { PrismaClient } from "@prisma/client";
import { createMockPrisma } from "./prismaMock";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const useMockPrisma =
  process.env.USE_MOCK_PRISMA === "1" || (!hasDatabaseUrl && process.env.CI);

if (!hasDatabaseUrl && !useMockPrisma) {
  throw new Error(
    "DATABASE_URL is not defined. Set USE_MOCK_PRISMA=1 to run with the in-memory mock.",
  );
}

const client =
  globalForPrisma.prisma ??
  (useMockPrisma ? createMockPrisma() : new PrismaClient());

export const prisma = client;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
