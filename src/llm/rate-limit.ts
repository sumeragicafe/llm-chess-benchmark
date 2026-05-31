import { LLMAdapter, PromptOptions } from "./types.js";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export function withRetry(adapter: LLMAdapter): LLMAdapter {
  return {
    async queryMove(fen: string, turn: "w" | "b", options?: PromptOptions): Promise<string> {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await adapter.queryMove(fen, turn, options);
        } catch (err: unknown) {
          const status = (err as { status?: number })?.status;
          if (status === 429 && attempt < MAX_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            await sleep(delay);
            continue;
          }
          throw err;
        }
      }
      throw new Error("Max retries exceeded");
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
