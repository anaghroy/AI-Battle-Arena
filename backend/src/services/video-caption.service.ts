import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import config from "../config/config.js";

// Init Gemini
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Download video → buffer
const downloadVideo = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
};

// VIDEO → TEXT DESCRIPTION
export const describeVideo = async (videoUrl: string) => {
  try {
    if (!videoUrl) {
      console.error("Invalid video URL");
      return null;
    }

    console.log("Downloading video:", videoUrl);

    const videoBuffer = await downloadVideo(videoUrl);

    if (!videoBuffer || videoBuffer.length === 0) {
      console.error("Empty video buffer");
      return null;
    }

    const MAX_SIZE = 8 * 1024 * 1024; // 8MB (Gemini safer range)
    if (videoBuffer.length > MAX_SIZE) {
      console.error("Video too large for Gemini:", videoBuffer.length);
      return null;
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Describe this video in 3-4 sentences. Focus on actions, objects, and environment.",
            },
            {
              inlineData: {
                mimeType: "video/mp4",
                data: videoBuffer.toString("base64"),
              },
            },
          ],
        },
      ],
    });

    const candidates = result?.response?.candidates;

    if (!candidates || candidates.length === 0) {
      console.error("No candidates from Gemini");
      return null;
    }

    const text =
      candidates[0]?.content?.parts?.[0]?.text || result?.response?.text?.();

    if (!text) {
      console.error("Empty text from Gemini");
      console.log("Full response:", JSON.stringify(result, null, 2));
      return null;
    }

    console.log("Description generated");

    return text;
  } catch (error: any) {
    console.error("describeVideo ERROR:", error.message);
    return null;
  }
};
