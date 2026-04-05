import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  id: string;
  type: "user" | "ai" | "ai-battle" | "error";
  text?: string;
  mode: "text" | "voice" | "image" | "pdf";
  timestamp: Date;
  agent?: string;
  data?: any; // To store ai-battle specialized structures (solutionA, solutionB, verdict)
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["user", "ai", "ai-battle", "error"],
      required: true,
    },
    text: { type: String },
    mode: {
      type: String,
      enum: ["text", "voice", "image", "pdf"],
      required: true,
    },
    timestamp: { type: Date, required: true },
    agent: { type: String },
    data: { type: Schema.Types.Mixed }, // Payload for ai-battle responses
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "New Chat",
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

// Sort by newest chats first
chatSchema.index({ createdAt: -1 });

// Text index for robust full-text searching functionality on titles and nested message contents
chatSchema.index(
  { title: "text", "messages.text": "text" },
  { weights: { title: 3, "messages.text": 1 }, name: "chat_text_index" }
);

export const ChatModel =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
