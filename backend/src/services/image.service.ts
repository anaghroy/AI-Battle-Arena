import fetch from "node-fetch";
import { imagekit } from "./imagekit.service.js";
import config from "../config/config.js";

// Ensure API key exists
if (!config.NVIDIA_API_KEY) {
  throw new Error("Missing NVIDIA_API_KEY");
}

const invokeUrl =
  "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell";

// Generate image
const generateImage = async (prompt: string): Promise<Buffer> => {
  try {
    const response = await fetch(invokeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.NVIDIA_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        width: 1024,
        height: 1024,
        steps: 4,
        seed: 0,
      }),
    });

    if (response.status !== 200) {
      const err = await response.text();
      console.error("NVIDIA API Error:", err);
      throw new Error("NVIDIA image generation failed");
    }

    const data: any = await response.json();

    const base64Image = data?.artifacts?.[0].base64;

    if (!base64Image) {
      throw new Error("No image returned from NVIDIA");
    }

    return Buffer.from(base64Image, "base64");
  } catch (error: any) {
    console.error("Generate Image Error:", error?.message || error);
    throw new Error("Image generation failed");
  }
};

// Upload image to ImageKit
const uploadToImageKit = async (buffer: Buffer, name: string) => {
  try {
    const base64 = buffer.toString("base64");

    const upload = await imagekit.upload({
      file: `data:image/png;base64,${base64}`,
      fileName: `${name}-${Date.now()}.png`,
      folder: "/AI-battle/Images",
    });

    return upload.url;
  } catch (error: any) {
    console.error("ImageKit Upload Error:", error?.message || error);
    throw new Error("Image upload failed");
  }
};
// Upload PDF to ImageKit
export const uploadPdfToImageKit = async (buffer: Buffer, name: string) => {
  const base64 = buffer.toString("base64");

  const upload = await imagekit.upload({
    file: `data:application/pdf;base64,${base64}`,
    fileName: `${name}-${Date.now()}.pdf`,
    folder: "/AI-battle/pdf-documents",
  });

  return upload.url;
};
// MAIN FUNCTION
export const generateImageBattle = async (prompt: string) => {
  try {
    const [imgA, imgB] = await Promise.all([
      generateImage(prompt),
      generateImage(prompt + ", cinematic lighting, ultra detailed"),
    ]);

    const [urlA, urlB] = await Promise.all([
      uploadToImageKit(imgA, "A"),
      uploadToImageKit(imgB, "B"),
    ]);

    return {
      solutionA: {
        imageUrl: urlA,
        model: "flux-1-schnell",
      },
      solutionB: {
        imageUrl: urlB,
        model: "flux-1-schnell",
      },
    };
  } catch (error: any) {
    throw new Error("Image generation failed");
  }
};
