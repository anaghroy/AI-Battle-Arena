import { OpenAI } from "openai";
import config from "../config/config.js";

const openrouter = new OpenAI({
  apiKey: config.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// Convert image URL → text description
export const describeImage = async (
  imageUrl: string,
): Promise<string | null> => {
  const models = [
    "openai/gpt-4o-mini",
    "meta-llama/llama-3.2-11b-vision-instruct",
  ];
  for (const modelName of models) {
    try {
      console.log(`Trying: ${modelName}`);

      const res = await openrouter.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Describe this image in 3-4 sentences.

Focus on:
- main subject
- environment
- lighting
- style (realistic, cinematic, etc.)
                `,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.5,
      });

      const text = res.choices?.[0]?.message?.content;

      if (text) {
        console.log(`Success: ${modelName}`);
        return text;
      }
    } catch (error: any) {
      console.error(`${modelName} failed:`, error.message);
      continue;
    }
  }

  throw new Error("All vision models failed");
};
