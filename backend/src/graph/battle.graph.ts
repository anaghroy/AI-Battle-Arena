import { START, END, StateGraph } from "@langchain/langgraph";
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
  }) as any;

  graph.addNode("judge", judgeNode);

  graph.addEdge(START, "judge");
  graph.addEdge("judge", END);

  return graph.compile();
};
