import { createClient } from "@deepgram/sdk";
import config from "../config/config.js";

const deepgram = createClient(config.DEEPGRAM_API_KEY);

export const speechToText = async (buffer: Buffer) => {
  try {
    const { result, error } =
      await deepgram.listen.prerecorded.transcribeFile(buffer, {
        model: "nova-2",
        smart_format: true,
      });

    if (error) {
      throw new Error("Deepgram transcription failed");
    }

    const text =
      result?.results?.channels[0]?.alternatives[0]?.transcript || "";

    return text;

  } catch (error) {
    throw new Error("Failed to convert speech to text");
  }
};