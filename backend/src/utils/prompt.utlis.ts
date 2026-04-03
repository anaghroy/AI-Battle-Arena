export const buildJudgePrompt = (
  input: string,
  solutionA: string,
  solutionB: string,
) => {
  return `
You are an expert AI judge.

User Problem:
${input}

Solution A:
${solutionA}

Solution B:
${solutionB}


Evaluate both based on:
- correctness
- clarity
- depth
- efficiency

Return STRICT JSON:
{
  "winner": "A" | "B",
  "scores": { "A": number, "B": number },
  "reasoning": "short explanation"
}
`;
};
