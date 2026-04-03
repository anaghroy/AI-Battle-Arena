import { createClient } from "@deepgram/sdk";
import config from "../config/config.js";

const deepgram = createClient(config.DEEPGRAM_API_KEY);

export const speechToText = async (buffer: Buffer) => {
  try {
    console.log("Sending audio to Deepgram...");

    const { result, error } =
      await deepgram.listen.prerecorded.transcribeFile(buffer, {
        model: "nova-2",
        smart_format: true,
      });

    if (error) {
      console.error("Deepgram Error:", error);
      throw new Error("Deepgram transcription failed");
    }

    const text =
      result?.results?.channels[0]?.alternatives[0]?.transcript || "";

    console.log("Transcription:", text);

    return text;

  } catch (error) {
    console.error("Speech-to-Text Error:", error);
    throw new Error("Failed to convert speech to text");
  }
};