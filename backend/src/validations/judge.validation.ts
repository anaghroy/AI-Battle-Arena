import { z } from "zod";

export const judgeResponseSchema = z.object({
  winner: z.enum(["A", "B", "unknown"]),
  reasoning: z.string().min(5),
  scores: z.object({
    A: z.number().transform((val) => Math.max(0, Math.min(10, val))),
    B: z.number().transform((val) => Math.max(0, Math.min(10, val))),
  }),
});

export type JudgeResponse = z.infer<typeof judgeResponseSchema>;
