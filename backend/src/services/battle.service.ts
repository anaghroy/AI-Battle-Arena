import {
  generateCohereSolution,
  generateGroqSolution,
} from "./model.service.js";
import { generateImageBattle } from "./image.service.js";
import { buildBattleGraph } from "../graph/battle.graph.js";
import { BattleModel } from "../models/battle.model.js";
import { describeImage } from "./image-caption.service.js";
import { generateSummaryA, generateSummaryB } from "./model.service.js";
import { uploadPdfToImageKit } from "./image.service.js";
import { extractPdfText } from "./pdf.service.js";
import { generateVideoBattle } from "./video.service.js";
import { describeVideo } from "./video-caption.service.js";

type BattleType = "text" | "image" | "pdf" | "video";

export const runBattle = async (
  userInput: string,
  type: BattleType = "text",
  fileBuffer?: Buffer,
) => {
  try {
    if (type === "pdf") {
      if (!fileBuffer) throw new Error("PDF file required");

      const text = await extractPdfText(fileBuffer);

      const trimmedText = text.slice(0, 5000);

      const [solutionA, solutionB] = await Promise.all([
        generateSummaryA(trimmedText),
        generateSummaryB(trimmedText),
      ]);

      const graph = buildBattleGraph();

      const result = await graph.invoke({
        userInput:
          "Compare two AI-generated summaries of a PDF and decide which is better",
        solutionA: solutionA.text,
        solutionB: solutionB.text,
      });

      const pdfUrl = await uploadPdfToImageKit(fileBuffer, "pdf");

      await BattleModel.create({
        type: "pdf",
        input: text.replace(/\s+/g, " ").slice(0, 4000),
        solutionA: {
          text: solutionA.text,
          model: solutionA.model,
          usage: solutionA.usage,
        },
        solutionB: {
          text: solutionB.text,
          model: solutionB.model,
          usage: solutionB.usage,
        },
        verdict: result.verdict,
        pdfUrl,
      });

      return {
        pdfUrl,
        solutionA,
        solutionB,
        verdict: result.verdict,
      };
    }
    if (type === "text") {
      const [solutionA, solutionB] = await Promise.all([
        generateCohereSolution(userInput),
        generateGroqSolution(userInput),
      ]);

      const graph = buildBattleGraph();

      const result = await graph.invoke({
        userInput,
        solutionA: solutionA.text,
        solutionB: solutionB.text,
      });

      await BattleModel.create({
        type: "text",
        input: userInput,
        solutionA,
        solutionB,
        verdict: result.verdict,
      });

      return { solutionA, solutionB, verdict: result.verdict };
    }

    if (type === "image") {
      const imageResult = await generateImageBattle(userInput);
      const { solutionA, solutionB } = imageResult;

      const [descA, descB] = await Promise.all([
        describeImage(solutionA.imageUrl),
        describeImage(solutionB.imageUrl),
      ]);

      const graph = buildBattleGraph();

      const result = await graph.invoke({
        userInput,
        solutionA: descA,
        solutionB: descB,
      });

      await BattleModel.create({
        type: "image",
        input: userInput,
        solutionA: {
          imageUrl: solutionA.imageUrl,
          text: descA,
          model: solutionA.model,
        },
        solutionB: {
          imageUrl: solutionB.imageUrl,
          text: descB,
          model: solutionB.model,
        },
        verdict: result.verdict,
      });

      return {
        solutionA: {
          ...solutionA,
          description: descA,
        },
        solutionB: {
          ...solutionB,
          description: descB,
        },
        verdict: result.verdict,
      };
    }
    if (type === "video") {
      const videoResult = await generateVideoBattle(userInput);
      const { solutionA, solutionB } = videoResult;

      const [descA, descB] = await Promise.all([
        describeVideo(solutionA.videoUrl),
        describeVideo(solutionB.videoUrl),
      ]);

      const graph = buildBattleGraph();

      const result = await graph.invoke({
        userInput,
        solutionA: descA,
        solutionB: descB,
      });

      await BattleModel.create({
        type: "video",
        input: userInput,
        solutionA: {
          text: descA,
          videoUrl: solutionA.videoUrl,
          model: solutionA.model,
        },
        solutionB: {
          text: descB,
          videoUrl: solutionB.videoUrl,
          model: solutionB.model,
        },
        verdict: result.verdict,
      });

      return {
        solutionA: {
          ...solutionA,
          description: descA,
        },
        solutionB: {
          ...solutionB,
          description: descB,
        },
        verdict: result.verdict,
      };
    }
  } catch (error) {
    console.error("Battle Service Error:", error);
    throw new Error("Battle execution failed");
  }
};
