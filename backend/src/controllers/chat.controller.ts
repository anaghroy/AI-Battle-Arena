import type { Request, Response } from "express";
import { ChatModel } from "../models/chat.model.js";

// GET ALL CHATS (Sidebar integration)
export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const chats = await ChatModel.find({ userId })
      .select("_id title createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

// GET SINGLE CHAT BY ID
export const getChatById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const chat = await ChatModel.findOne({ _id: id, userId });
    
    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    res.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat details" });
  }
};

// CREATE OR UPDATE CHAT SESSION
export const syncChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { chatId, messages } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!messages || messages.length === 0) {
      res.status(400).json({ error: "Messages array cannot be empty" });
      return;
    }

    if (chatId) {
      // Update existing chat
      const updatedChat = await ChatModel.findOneAndUpdate(
        { _id: chatId, userId },
        { messages, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedChat) {
        res.status(404).json({ error: "Chat not found or unauthorized" });
        return;
      }
      res.json(updatedChat);
    } else {
      // Create new chat
      // Auto-generate title from the first user message
      const firstUserMsg = messages.find((m: any) => m.type === "user");
      let title = "New Chat";
      if (firstUserMsg && firstUserMsg.text) {
        title = firstUserMsg.text.length > 10 ? firstUserMsg.text.substring(0, 10) + '...' : firstUserMsg.text;
      } else if (firstUserMsg && firstUserMsg.mode === "voice") {
        title = "Voice Session";
      } else if (firstUserMsg && firstUserMsg.mode === "pdf") {
        title = "PDF Analysis";
      }

      const newChat = await ChatModel.create({
        userId,
        title,
        messages,
      });

      res.status(201).json(newChat);
    }
  } catch (error) {
    console.error("Error syncing chat:", error);
    res.status(500).json({ error: "Failed to sync chat" });
  }
};

// DELETE CHAT
export const deleteChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const deleted = await ChatModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ error: "Chat not found or unauthorized to delete" });
      return;
    }

    res.json({ message: "Chat deleted successfully", id });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};
