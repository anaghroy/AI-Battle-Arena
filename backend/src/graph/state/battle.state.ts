export type BattleState = {
  userInput: string;

  solutionA?: string;
  solutionB?: string;

  verdict?: {
    winner: string;
    reasoning: string;
    scores: {
      A: number;
      B: number;
    };
  };
};
