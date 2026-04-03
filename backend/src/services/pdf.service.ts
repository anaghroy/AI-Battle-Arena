import { PDFParse } from "pdf-parse";

export const extractPdfText = async (buffer: Buffer): Promise<string> => {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    console.error("PDF Parse Error:", error);
    throw new Error("Failed to extract PDF text");
  }
};
