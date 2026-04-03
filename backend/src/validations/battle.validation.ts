import { z } from "zod";

export const battleRequestSchema = z.object({
  input: z
    .string()
    .min(5, "Input must be at least 5 characters")
    .max(1000, "Input too long"),
});

export type BattleRequest = z.infer<typeof battleRequestSchema>;