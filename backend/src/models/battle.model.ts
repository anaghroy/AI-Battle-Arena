import mongoose, { Schema, Document } from "mongoose";

export interface IBattle extends Document {
  input: string;
  type: "text" | "image" | "pdf" | "video";
  pdfUrl?: string;
  videoUrl?: string;
  solutionA: {
    text?: string;
    imageUrl?: string;
    model: string;
    usage?: Record<string, any>;
  };

  solutionB: {
    text?: string;
    imageUrl?: string;
    model: string;
    usage?: Record<string, any>;
  };

  verdict: {
    winner: "A" | "B" | "unknown";
    reasoning: string;
    scores: {
      A: number;
      B: number;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

const battleSchema = new Schema<IBattle>(
  {
    type: {
      type: String,
      enum: ["text", "image", "pdf", "video"],
      required: true,
    },
    pdfUrl: {
      type: String,
    },
    videoUrl:{
      type: String,
    },
    input: {
      type: String,
      required: true,
      trim: true,
    },

    solutionA: {
      text: { type: String },
      imageUrl: { type: String },
      model: { type: String, required: true },
      usage: { type: Schema.Types.Mixed },
    },

    solutionB: {
      text: { type: String },
      imageUrl: { type: String },
      model: { type: String, required: true },
      usage: { type: Schema.Types.Mixed },
    },

    verdict: {
      winner: {
        type: String,
        enum: ["A", "B", "unknown"],
        required: true,
      },
      reasoning: { type: String, required: true },
      scores: {
        A: { type: Number, required: true },
        B: { type: Number, required: true },
      },
    },
  },
  {
    timestamps: true,
  },
);

// Search by input
battleSchema.index({ input: "text" });

// Filter by winner
battleSchema.index({ "verdict.winner": 1 });

// Sort by latest
battleSchema.index({ createdAt: -1 });

// MODEL
export const BattleModel =
  mongoose.models.Battle || mongoose.model<IBattle>("Battle", battleSchema);
