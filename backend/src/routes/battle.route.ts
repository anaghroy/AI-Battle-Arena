import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import {
  createBattle,
  imageBattle,
  pdfBattle,
  voiceBattle,
  videoBattle
} from "../controllers/battle.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authUser, createBattle);

router.post("/voice", upload.single("audio"), voiceBattle);

router.post("/image", imageBattle);

router.post("/pdf", upload.single("file"), pdfBattle);

router.post("/video", videoBattle);
export default router;
