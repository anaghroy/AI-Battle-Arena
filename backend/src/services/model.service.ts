import { OpenAI } from "openai";
import { CohereClient } from "cohere-ai";
import Groq from "groq-sdk";
import config from "../config/config.js";

// ENV CONFIG

const { OPENROUTER_API_KEY, COHERE_API_KEY, GROQ_API_KEY } = config;

if (!OPENROUTER_API_KEY || !COHERE_API_KEY || !GROQ_API_KEY) {
  throw new Error("Missing API keys in environment variables");
}

const openrouter = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const cohere = new CohereClient({
  token: COHERE_API_KEY,
});

const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

// TYPES

export type ModelResponse = {
  text: string;
  model: string;
  usage?: any;
};

// COHERE → Solution A

export const generateCohereSolution = async (
  prompt: string,
): Promise<ModelResponse> => {
  try {
    const response = await cohere.chat({
      model: "command-r-plus-08-2024",
      message: prompt,
      temperature: 0.7,
    });

    return {
      text: response.text || "",
      model: "cohere-command-r-plus",
      usage: response.meta,
    };
  } catch (error) {
    console.error("Cohere Error:", error);
    throw new Error("Failed to generate Cohere solution");
  }
};

// GROQ → Solution B (LLaMA)

export const generateGroqSolution = async (
  prompt: string,
): Promise<ModelResponse> => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return {
      text: completion.choices[0]?.message?.content || "",
      model: "groq-llama-3.3-70b",
      usage: completion.usage,
    };
  } catch (error) {
    console.error("Groq Error:", error);
    throw new Error("Failed to generate Groq solution");
  }
};

// GEMINI → JUDGE

export const judgeSolutions = async (
  prompt: string,
): Promise<ModelResponse> => {
  const models = [
    "openchat/openchat-7b:free",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
    "meta-llama/llama-3-8b-instruct",
  ];

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);

      const completion = await openrouter.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const text = completion.choices?.[0]?.message?.content;

      if (!text) {
        console.warn(`Empty response from ${modelName}`);
        continue;
      }

      console.log(`Success with ${modelName}`);

      return {
        text,
        model: modelName,
      };
    } catch (error: any) {
      console.error(`${modelName} failed:`, error.message);
      continue;
    }
  }

  throw new Error("All free models failed");
};

export const generateSummaryA = async (text: string) => {
  return generateCohereSolution(`Summarize this PDF:\n${text}`);
};

export const generateSummaryB = async (text: string) => {
  return generateGroqSolution(`Summarize this PDF:\n${text}`);
};

export const generateBattleSolutions = async (prompt: string) => {
  try {
    const [solutionA, solutionB] = await Promise.all([
      generateCohereSolution(prompt),
      generateGroqSolution(prompt),
    ]);

    return {
      solutionA,
      solutionB,
    };
  } catch (error) {
    throw new Error("Failed to generate battle solutions");
  }
};
