import express from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { getChats, getChatById, syncChat, deleteChat } from "../controllers/chat.controller.js";

const router = express.Router();

// Get side-bar chat history list
router.get("/", authUser, getChats);

// Get specific full chat session
router.get("/:id", authUser, getChatById);

// Create or update chat session messages array
router.post("/sync", authUser, syncChat);

// Delete chat completely
router.delete("/:id", authUser, deleteChat);

export default router;
