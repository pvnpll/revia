import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/revia?schema=public"),
  MOCK_USER_ID: z.string().uuid().default("00000000-0000-0000-0000-000000000001"),
  MOCK_USER_EMAIL: z.string().email().default("demo@decklearning.app"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  MOCK_USER_ID: process.env.MOCK_USER_ID,
  MOCK_USER_EMAIL: process.env.MOCK_USER_EMAIL,
  NODE_ENV: process.env.NODE_ENV,
});
