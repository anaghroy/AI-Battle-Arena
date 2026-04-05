import type { Request, Response } from "express";
import { BattleModel } from "../models/battle.model.js";

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const battles = await BattleModel.find().sort({ createdAt: 1 }).lean();

    const ratings: Record<string, { elo: number; matches: number; wins: number }> = {};

    const getModelStats = (model: string) => {
      if (!ratings[model]) {
        ratings[model] = { elo: 1200, matches: 0, wins: 0 };
      }
      return ratings[model]!;
    };

    const K = 32;

    for (const battle of battles) {
      if (!battle.solutionA || !battle.solutionB || !battle.verdict) continue;
      
      const modelA = battle.solutionA.model;
      const modelB = battle.solutionB.model;
      // Some mock data might have models empty if failed, skip them
      if (!modelA || !modelB) continue;

      const winner = battle.verdict.winner;

      if (winner === "unknown") {
        // Technically could treat as 0.5 for tie, but we'll ignore for simple ELO
        continue;
      }

      const statsA = getModelStats(modelA);
      const statsB = getModelStats(modelB);

      statsA.matches++;
      statsB.matches++;

      const expectedA = 1 / (1 + Math.pow(10, (statsB.elo - statsA.elo) / 400));
      const expectedB = 1 / (1 + Math.pow(10, (statsA.elo - statsB.elo) / 400));

      let actualA = 0;
      let actualB = 0;

      if (winner === "A") {
        actualA = 1;
        statsA.wins++;
      } else if (winner === "B") {
        actualB = 1;
        statsB.wins++;
      }

      statsA.elo = statsA.elo + K * (actualA - expectedA);
      statsB.elo = statsB.elo + K * (actualB - expectedB);
    }

    const leaderboard = Object.keys(ratings).map((model) => {
      const stat = ratings[model]!;
      return {
        name: model,
        elo: Math.round(stat.elo),
        matches: stat.matches,
        wins: stat.wins,
        winRate: Math.round((stat.wins / stat.matches) * 100) || 0,
      };
    });

    leaderboard.sort((a, b) => b.elo - a.elo);

    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    res.status(200).json({ success: true, leaderboard: rankedLeaderboard });
  } catch (error: any) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ success: false, message: "Error fetching leaderboard." });
  }
};
