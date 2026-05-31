import OpenAI from "openai";
import { LLMAdapter, LLMConfig, PromptOptions } from "./types.js";
import { buildPrompt } from "./prompt.js";

export class OpenAICompatibleAdapter implements LLMAdapter {
  private client: OpenAI;
  private model: string;
  private temperature: number;

  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey ?? "dummy",
      baseURL: config.baseUrl,
    });
    this.model = config.model;
    this.temperature = config.temperature;
  }

  async queryMove(fen: string, turn: "w" | "b", options?: PromptOptions): Promise<string> {
    const prompt = buildPrompt(fen, turn, options);
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0]?.message?.content?.trim() ?? "";
  }
}
