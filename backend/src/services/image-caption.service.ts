import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/config.js";

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// Convert image URL → text description
export const describeImage = async (imageUrl: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent([
      {
        text: "Describe this image in detail for comparison. Focus on style, objects, lighting, and quality.",
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: await fetchImageAsBase64(imageUrl),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Image Caption Error:", error);
    throw new Error("Failed to describe image");
  }
};

// Helper → convert URL → base64
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
};