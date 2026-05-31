import { GoogleGenAI } from "@google/genai";
import { LLMAdapter, LLMConfig, PromptOptions } from "./types.js";
import { buildPrompt } from "./prompt.js";

export class GeminiAdapter implements LLMAdapter {
  private client: GoogleGenAI;
  private model: string;
  private temperature: number;

  constructor(config: LLMConfig) {
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model;
    this.temperature = config.temperature;
  }

  async queryMove(fen: string, turn: "w" | "b", options?: PromptOptions): Promise<string> {
    const prompt = buildPrompt(fen, turn, options);
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        temperature: this.temperature,
      },
    });
    return response.text?.trim() ?? "";
  }
}
