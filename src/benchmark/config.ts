import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { BenchmarkConfig } from "./types.js";

const CONFIG_FILE = ".chess-bench.json";

export function loadConfig(cliFlags: Record<string, string | boolean | undefined>): BenchmarkConfig {
  let fileConfig: Partial<BenchmarkConfig> = {};
  const configPath = resolve(process.cwd(), CONFIG_FILE);
  if (existsSync(configPath)) {
    fileConfig = JSON.parse(readFileSync(configPath, "utf-8"));
  }

  const provider = (cliFlags.provider as BenchmarkConfig["provider"]) ?? fileConfig.provider ?? "openai";
  const apiKey = getApiKey(provider);

  return {
    provider,
    model: (cliFlags.model as string) ?? fileConfig.model ?? "",
    temperature: Number(cliFlags.temperature ?? fileConfig.temperature ?? 0.1),
    puzzles: Number(cliFlags.puzzles ?? fileConfig.puzzles ?? 20),
    minRating: Number(cliFlags.minRating ?? fileConfig.minRating ?? 0),
    maxRating: Number(cliFlags.maxRating ?? fileConfig.maxRating ?? 9999),
    themes: parseThemes((cliFlags.themes as string) ?? fileConfig.themes),
    seed: cliFlags.seed != null ? Number(cliFlags.seed) : fileConfig.seed,
    concurrency: Number(cliFlags.concurrency ?? fileConfig.concurrency ?? 5),
    baseUrl: (cliFlags.baseUrl as string) ?? fileConfig.baseUrl,
    includeHistory: Boolean(cliFlags.includeHistory ?? fileConfig.includeHistory ?? false),
    bundled: Boolean(cliFlags.bundled ?? fileConfig.bundled ?? false),
    verbose: Boolean(cliFlags.verbose ?? fileConfig.verbose ?? false),
    outputFile: (cliFlags.output as string) ?? fileConfig.outputFile,
    ...apiKey ? {} : {},
  };
}

function getApiKey(provider: string): string | undefined {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    case "gemini":
      return process.env.GEMINI_API_KEY;
    default:
      return process.env.OPENAI_API_KEY;
  }
}

function parseThemes(themes?: string | string[]): string[] {
  if (!themes) return [];
  if (Array.isArray(themes)) return themes;
  return themes.split(",").map((t) => t.trim()).filter(Boolean);
}
