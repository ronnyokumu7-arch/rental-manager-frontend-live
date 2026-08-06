// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  // Validates that it's a proper URL, falls back to localhost if missing
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("https://rental-manager-backend-live.onrender.com/api/v1"),
    
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables. Check your .env file.");
}

export const env = parsed.data;