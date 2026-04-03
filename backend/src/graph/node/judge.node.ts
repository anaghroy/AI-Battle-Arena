import type { BattleState } from "../state/battle.state.js";
import { judgeSolutions } from "../../services/model.service.js";
import { buildJudgePrompt } from "../../utils/prompt.utlis.js";
import { judgeResponseSchema } from "../../validations/judge.validation.js";

const cleanJSON = (text: string): string => {
  return text
    .replace(/```json/g, "") // remove ```json
    .replace(/```/g, "") // remove ```
    .trim(); // remove spaces/newlines
};
const extractJSON = (text: string): string | null => {
  const cleaned = cleanJSON(text);
  const match = cleaned.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
};
export const judgeNode = async (
  state: BattleState,
): Promise<Partial<BattleState>> => {
  try {
    const { userInput, solutionA, solutionB } = state;

    // Proper validation (no ! needed)
    if (!solutionA || !solutionB) {
      throw new Error("Both solutions are required for judging");
    }

    const prompt = buildJudgePrompt(userInput, solutionA, solutionB);

    const response = await judgeSolutions(prompt);

    // Step 1: Parse JSON safely
    let json;
    try {
      const extracted = extractJSON(response.text);

      if (!extracted) {
        throw new Error("No JSON found");
      }
      json = JSON.parse(extracted);
    } catch {
      throw new Error("Invalid JSON from judge");
    }

    // Step 2: Validate with Zod
    const result = judgeResponseSchema.safeParse(json);

    if (!result.success) {
      console.error("Zod validation error:", result.error);

      return {
        verdict: {
          winner: "unknown",
          reasoning: "Invalid judge response format",
          scores: { A: 0, B: 0 },
        },
      };
    }

    // Valid data
    return {
      verdict: result.data,
    };
  } catch (error) {
    console.error("Judge Node Error:", error);

    return {
      verdict: {
        winner: "unknown",
        reasoning: "Judge failed",
        scores: { A: 0, B: 0 },
      },
    };
  }
};
