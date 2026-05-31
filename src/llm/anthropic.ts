import Anthropic from "@anthropic-ai/sdk";
import { LLMAdapter, LLMConfig, PromptOptions } from "./types.js";
import { buildPrompt } from "./prompt.js";

export class AnthropicAdapter implements LLMAdapter {
  private client: Anthropic;
  private model: string;
  private temperature: number;

  constructor(config: LLMConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model;
    this.temperature = config.temperature;
  }

  async queryMove(fen: string, turn: "w" | "b", options?: PromptOptions): Promise<string> {
    const prompt = buildPrompt(fen, turn, options);
    const response = await this.client.messages.create({
      model: this.model,
      temperature: this.temperature,
      max_tokens: 50,
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = response.content[0];
    if (textBlock.type === "text") {
      return textBlock.text.trim();
    }
    return "";
  }
}
