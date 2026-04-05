import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import config from "../config/config.js";

// Init Gemini
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // supports video
});

// 🔽 Download video → buffer
const downloadVideo = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
};

// 🎬 VIDEO → TEXT DESCRIPTION
export const describeVideo = async (videoUrl: string) => {
  try {
    console.log("Downloading video...");

    const videoBuffer = await downloadVideo(videoUrl);

    console.log("Sending to Gemini...");

    const result = await model.generateContent([
      {
        text: `
You are an expert video analyst.

Describe this video in detail including:
- what is happening
- objects
- motion
- environment
- quality

Keep it concise but informative.
        `,
      },
      {
        inlineData: {
          mimeType: "video/mp4",
          data: videoBuffer.toString("base64"),
        },
      },
    ]);

    const text = result.response.text();

    console.log("Video description:", text);

    return text;
  } catch (error: any) {
    console.error(
      "Video Caption Error:",
      error?.message || error
    );
    throw new Error("Failed to describe video");
  }
};