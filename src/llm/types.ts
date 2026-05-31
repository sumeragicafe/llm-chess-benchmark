export interface LLMAdapter {
  queryMove(fen: string, turn: "w" | "b", options?: PromptOptions): Promise<string>;
}

export interface PromptOptions {
  includeHistory?: boolean;
  pgn?: string;
}

export interface LLMConfig {
  provider: "openai" | "anthropic" | "openai-compatible" | "gemini";
  model: string;
  temperature: number;
  baseUrl?: string;
  apiKey?: string;
}
