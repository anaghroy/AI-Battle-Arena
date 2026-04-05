import type { Request, Response } from "express";
import { runBattle } from "../services/battle.service.js";
import { battleRequestSchema } from "../validations/battle.validation.js";
import { speechToText } from "../services/speech.service.js";

// TEXT BATTLE
export const createBattle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const parsed = battleRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.flatten(),
      });
      return;
    }

    const { input } = parsed.data;

    const result = await runBattle(input);

    res.json(result);
  } catch (error) {
    console.error("Battle Error:", error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

// VOICE BATTLE
export const voiceBattle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "Audio file is required" });
      return;
    }

    console.log("File received:", file.originalname);

    const text = await speechToText(file.buffer);

    console.log("Transcribed Text:", text);

    const result = await runBattle(text);

    res.json({
      input: text,
      ...result,
    });
  } catch (error) {
    console.error("Voice Battle Error:", error);

    res.status(500).json({
      error: "Voice processing failed",
    });
  }
};

// IMAGE BATTLE
export const imageBattle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const result = await runBattle(prompt, "image");

    res.json(result);
  } catch (error) {
    console.error("Image Battle Error:", error);

    res.status(500).json({
      error: "Image generation failed",
    });
  }
};

// PDF BATTLE
export const pdfBattle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "PDF required" });
      return;
    }

    const result = await runBattle("", "pdf", file.buffer);

    res.json(result);
  } catch (error) {
    console.error("PDF Battle Error:", error);

    res.status(500).json({
      error: "PDF processing failed",
    });
  }
};

export const videoBattle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { input } = req.body;

    const result = await runBattle(input, "video");

    res.json(result);
  } catch (error) {
    console.error("Video Battle Error:", error);

    res.status(500).json({
      error: "Video processing failed",
    });
  }
};
