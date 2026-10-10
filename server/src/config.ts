import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().default('./triagedesk.sqlite'),
  TRIAGE_PROVIDER: z.enum(['mock', 'claude']).default('mock'),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  CLAUDE_MODEL: z.string().default('claude-3-7-sonnet-20250219'),
});

export const config = envSchema.parse(process.env);
export type Config = z.infer<typeof envSchema>;
