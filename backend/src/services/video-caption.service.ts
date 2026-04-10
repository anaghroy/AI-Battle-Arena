import { OpenAI } from "openai";
import config from "../config/config.js";

// Init Gemini
const openrouter = new OpenAI({
  apiKey: config.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// const model = openrouter.chat.completions.create({
//   model: "gemini-2.5-flash",
// });

// // Download video → buffer
// const downloadVideo = async (url: string): Promise<Buffer> => {
//   const response = await axios.get(url, {
//     responseType: "arraybuffer",
//   });

//   return Buffer.from(response.data);
// };

// VIDEO → TEXT DESCRIPTION
export const describeVideo = async (prompt: string): Promise<string | null> => {
  const models = [
    "openchat/openchat-7b:free",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
    "meta-llama/llama-3-8b-instruct",
  ];

  const finalPrompt = `
You are a video description AI.

User prompt:
"${prompt}"

Generate a realistic video description in 3-4 sentences.

Focus on:
- actions
- objects
- environment
- motion
`;

  for (const modelName of models) {
    try {
      console.log(`Describe using: ${modelName}`);

      const res = await openrouter.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: finalPrompt }],
        temperature: 0.7,
      });

      const text = res.choices?.[0]?.message?.content;

      if (text) {
        console.log(`Description success: ${modelName}`);
        return text;
      }
    } catch (err: any) {
      console.log(`${modelName} failed: ${err.message}`);
      continue;
    }
  }

  return null;
};
