import { LLMAdapter, LLMConfig } from "../llm/types.js";
import { OpenAIAdapter } from "../llm/openai.js";
import { AnthropicAdapter } from "../llm/anthropic.js";
import { OpenAICompatibleAdapter } from "../llm/openai-compatible.js";
import { GeminiAdapter } from "../llm/gemini.js";
import { withRetry } from "../llm/rate-limit.js";
import { parseMove } from "../llm/parser.js";
import { fetchPuzzleById, fetchRandomPuzzles } from "../puzzle/fetcher.js";
import { parsePuzzleResponse, createPuzzleFromBundled } from "../puzzle/parser.js";
import { selectPuzzles } from "../puzzle/selector.js";
import { BUNDLED_PUZZLES } from "../puzzle/bundled.js";
import { evaluateMove } from "./evaluator.js";
import { aggregateByRatingBracket, aggregateByTheme } from "./aggregator.js";
import { createProgressBar, stopProgress } from "./progress.js";
import { BenchmarkConfig, BenchmarkResult, PuzzleEvaluation } from "./types.js";
import { Puzzle } from "../puzzle/types.js";

function createAdapter(config: BenchmarkConfig): LLMAdapter {
  const llmConfig: LLMConfig = {
    provider: config.provider,
    model: config.model,
    temperature: config.temperature,
    baseUrl: config.baseUrl,
    apiKey: getApiKey(config.provider),
  };

  let adapter: LLMAdapter;
  switch (config.provider) {
    case "openai":
      adapter = new OpenAIAdapter(llmConfig);
      break;
    case "anthropic":
      adapter = new AnthropicAdapter(llmConfig);
      break;
    case "openai-compatible":
      adapter = new OpenAICompatibleAdapter(llmConfig);
      break;
    case "gemini":
      adapter = new GeminiAdapter(llmConfig);
      break;
  }

  return withRetry(adapter);
}

function getApiKey(provider: string): string | undefined {
  switch (provider) {
    case "openai":
    case "openai-compatible":
      return process.env.OPENAI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "gemini":
      return process.env.GEMINI_API_KEY;
    default:
      return undefined;
  }
}

async function loadPuzzles(config: BenchmarkConfig): Promise<Puzzle[]> {
  if (config.bundled) {
    const entries = selectPuzzles({
      count: config.puzzles,
      minRating: config.minRating,
      maxRating: config.maxRating,
      themes: config.themes,
      seed: config.seed,
    });
    return entries.map(createPuzzleFromBundled);
  }

  console.log("Fetching puzzles from Lichess...");

  const shuffledIds = [...BUNDLED_PUZZLES.map((p) => p.id)].sort(() => Math.random() - 0.5);
  const puzzles: Puzzle[] = [];
  const concurrency = Math.min(config.concurrency ?? 3, 5);

  async function fetchOneById(): Promise<Puzzle | null> {
    while (shuffledIds.length > 0) {
      const id = shuffledIds.pop()!;
      try {
        const raw = await fetchPuzzleById(id);
        const puzzle = parsePuzzleResponse(raw);
        if (config.minRating && puzzle.rating < config.minRating) continue;
        if (config.maxRating && puzzle.rating > config.maxRating) continue;
        return puzzle;
      } catch {
        continue;
      }
    }
    return null;
  }

  async function worker() {
    while (puzzles.length < config.puzzles) {
      const puzzle = await fetchOneById();
      if (!puzzle) break;
      puzzles.push(puzzle);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return puzzles;
}

async function evaluatePuzzle(
  puzzle: Puzzle,
  adapter: LLMAdapter,
  config: BenchmarkConfig,
): Promise<PuzzleEvaluation> {
  const turn = puzzle.playerFen.includes(" w ") ? "w" : "b";
  let rawResponse: string;
  try {
    rawResponse = await adapter.queryMove(puzzle.playerFen, turn as "w" | "b", {
      includeHistory: config.includeHistory,
    });
  } catch (err) {
    return evaluateMove(puzzle, null, `ERROR: ${err}`);
  }

  const actualMove = parseMove(rawResponse, puzzle.playerFen);
  return evaluateMove(puzzle, actualMove, rawResponse);
}

async function runConcurrent(
  puzzles: Puzzle[],
  adapter: LLMAdapter,
  config: BenchmarkConfig,
): Promise<PuzzleEvaluation[]> {
  const bar = createProgressBar(puzzles.length);
  const results: PuzzleEvaluation[] = [];
  let completed = 0;
  let correct = 0;

  const queue = [...puzzles];

  async function worker() {
    while (queue.length > 0) {
      const puzzle = queue.shift();
      if (!puzzle) break;
      const result = await evaluatePuzzle(puzzle, adapter, config);
      results.push(result);
      completed++;
      if (result.correct) correct++;
      bar.update(completed, { accuracy: ((correct / completed) * 100).toFixed(1) });
    }
  }

  const workers = Array.from({ length: Math.min(config.concurrency, puzzles.length) }, () => worker());
  await Promise.all(workers);

  stopProgress(bar, correct, puzzles.length);

  return results;
}

export async function runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
  const adapter = createAdapter(config);
  const puzzles = await loadPuzzles(config);

  if (puzzles.length === 0) {
    throw new Error("No puzzles loaded. Check filters or network connectivity.");
  }

  const evaluations = await runConcurrent(puzzles, adapter, config);
  const correct = evaluations.filter((e) => e.correct).length;
  const avgRating =
    evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length;

  return {
    model: config.model,
    provider: config.provider,
    timestamp: new Date().toISOString(),
    totalPuzzles: evaluations.length,
    correct,
    accuracy: evaluations.length > 0 ? (correct / evaluations.length) * 100 : 0,
    averageRating: Math.round(avgRating),
    evaluations,
    ratingBrackets: aggregateByRatingBracket(evaluations),
    themeResults: aggregateByTheme(evaluations),
  };
}
