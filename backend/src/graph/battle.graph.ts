import { START, StateGraph } from "@langchain/langgraph";
import type { BattleState } from "./state/battle.state.js";
import { judgeNode } from "./node/judge.node.js";

export const buildBattleGraph = () => {
  const graph = new StateGraph<BattleState>({
    channels: {
      userInput: null,
      solutionA: null,
      solutionB: null,
      verdict: null,
    },
  });

  graph.addNode("judge", judgeNode);

  graph.addEdge(START, "judge");

  return graph.compile();
};
