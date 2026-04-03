import { config as dotenvConfig } from "dotenv";
dotenvConfig();

type AppConfig = {
  readonly MONGODB_URI: string;
  readonly JWT_SECRET: string;
  readonly GEMINI_API_KEY: string;
  readonly COHERE_API_KEY: string;
  readonly GROQ_API_KEY: string;
  readonly DEEPGRAM_API_KEY: string;
  readonly NVIDIA_API_KEY: string;
  readonly BREVO_SENDER_EMAIL: string;
  readonly BREVO_API_KEY: string;
  readonly IMAGEKIT_PUBLIC_KEY: string;
  readonly IMAGEKIT_PRIVATE_KEY: string;
  readonly IMAGEKIT_URL_ENDPOINT: string;
};

const config: AppConfig = {
  MONGODB_URI: process.env.MONGODB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
  COHERE_API_KEY: process.env.COHERE_API_KEY as string,
  GROQ_API_KEY: process.env.GROQ_API_KEY as string,
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY as string,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY as string,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL as string,
  BREVO_API_KEY: process.env.BREVO_API_KEY as string,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY as string,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY as string,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT as string,
};

export default config;
