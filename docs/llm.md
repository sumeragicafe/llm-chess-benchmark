# LLM Module

**Directory**: `src/llm/`

Responsible for building prompts, calling LLM APIs, parsing move responses, and handling rate limits.

## Files

| File | Purpose |
|------|---------|
| `types.ts` | `LLMAdapter` interface, `LLMConfig`, `PromptOptions` |
| `prompt.ts` | `buildPrompt()` — generates the chess position prompt |
| `parser.ts` | `parseMove()` — extracts a legal UCI move from the LLM response |
| `openai.ts` | OpenAI adapter |
| `anthropic.ts` | Anthropic adapter |
| `gemini.ts` | Google Gemini adapter (`@google/genai`) |
| `openai-compatible.ts` | Custom base URL adapter (Ollama, vLLM, etc.) |
| `rate-limit.ts` | `withRetry()` — wraps any adapter with exponential backoff for 429s |

## LLMAdapter Interface

```typescript
interface LLMAdapter {
  queryMove(fen: string, turn: "w" | "b", options?: PromptOptions): Promise<string>;
}
```

Every provider implements this single method. It receives the FEN position and turn, returns the raw LLM response string. The adapter is responsible for building the prompt internally (via `buildPrompt()`) and calling the API.

## Prompt Format

`buildPrompt()` generates a prompt asking the model to respond with only a UCI move:

```
You are given a chess position in FEN notation: <fen>
It is White's turn to move.
Find the best move for White.
Respond with ONLY the move in UCI notation (e.g., e2e4, b1c3, e7e8q for promotion).
Do not include any explanation or commentary.
```

With `--include-history`, the game's PGN is inserted into the prompt.

## Move Parsing

`parseMove()` tries two strategies:

1. **UCI match**: Looks for a pattern like `e2e4` or `e7e8q`, validates it against legal moves via chess.js
2. **SAN match**: Looks for algebraic notation like `Nf3` or `O-O`, tries to apply it via chess.js

Both return a normalized UCI string (`from` + `to` + optional `promotion`), or `null` if no legal move is found.

## Rate Limiting

`withRetry()` wraps any `LLMAdapter` with automatic retry on HTTP 429 responses. Uses exponential backoff (1s, 2s, 4s) with up to 3 retries. Applied automatically in `runner.ts` when creating adapters.

## Adding a New Provider

1. **Create the adapter** — Add `src/llm/<provider>.ts` implementing `LLMAdapter`:
   ```typescript
   export class MyProviderAdapter implements LLMAdapter {
     async queryMove(fen: string, turn: "w" | "b", options?: PromptOptions): Promise<string> {
       const prompt = buildPrompt(fen, turn, options);
       // call your API, return raw response string
     }
   }
   ```

2. **Register in config types** — Add the provider name to the `LLMConfig["provider"]` union in `src/llm/types.ts`

3. **Register in CLI** — Add it to the provider option choices in `src/cli.ts` and validation in `src/commands/bench.ts`

4. **Wire up in runner** — Add a case to the `switch` in `createAdapter()` in `src/benchmark/runner.ts`

5. **Add API key handling** — Add a case to `getApiKey()` in both `src/benchmark/runner.ts` and `src/benchmark/config.ts`
