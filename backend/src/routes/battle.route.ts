import express from "express";
import { runBattle } from "../services/battle.service.js";
import { battleRequestSchema } from "../validations/battle.validation.js";
import { speechToText } from "../services/speech.service.js";

import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Validate request using Zod
    const parsed = battleRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten(),
      });
    }

    const { input } = parsed.data;

    // Run your battle logic
    const result = await runBattle(input);

    return res.json(result);
  } catch (error) {
    console.error("Route Error:", error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

router.post("/voice", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    console.log("File received:", req.file.originalname);

    const text = await speechToText(req.file.buffer);

    console.log("Transcribed Text:", text);

    const result = await runBattle(text);

    return res.json({
      input: text,
      ...result,
    });
  } catch (error) {
    console.error("Voice Route Error:", error);

    return res.status(500).json({
      error: "Voice processing failed",
    });
  }
});

router.post("/image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await runBattle(prompt, "image");

    return res.json(result);
  } catch (error) {
    console.error("Image Route Error:", error);

    return res.status(500).json({
      error: "Image generation failed",
    });
  }
});

router.post("/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF required" });
    }

    const result = await runBattle(
      "",
      "pdf",
      req.file.buffer
    );

    return res.json(result);
  } catch (error) {
    console.error("PDF Route Error:", error);
    res.status(500).json({ error: "PDF processing failed" });
  }
});
export default router;
