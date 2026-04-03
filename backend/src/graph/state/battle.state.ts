export type BattleState = {
  userInput: String;

  solutionA?: String;
  solutionB?: String;

  verdict?: {
    winner: String;
    reasoning: String;
    scores: {
      A: number;
      B: number;
    };
  };
};
