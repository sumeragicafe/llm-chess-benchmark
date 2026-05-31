#!/usr/bin/env node
import { Command } from "commander";
import { benchCommand } from "./commands/bench.js";
import { compareCommand } from "./commands/compare.js";

const program = new Command();

program
  .name("llm-chess-benchmark")
  .description("Benchmark LLMs on chess puzzles from the Lichess puzzle database")
  .version("1.0.0");

program
  .command("bench")
  .description("Run a benchmark against an LLM")
  .requiredOption("-m, --model <model>", "LLM model to benchmark")
  .option("-p, --provider <provider>", "LLM provider (openai|anthropic|openai-compatible|gemini)", "openai")
  .option("-n, --puzzles <count>", "Number of puzzles to evaluate", "20")
  .option("--min-rating <rating>", "Minimum puzzle rating", "0")
  .option("--max-rating <rating>", "Maximum puzzle rating", "9999")
  .option("--themes <themes>", "Comma-separated list of puzzle themes to filter by")
  .option("--seed <seed>", "Random seed for reproducible puzzle selection")
  .option("--concurrency <n>", "Max concurrent LLM requests", "5")
  .option("--temperature <temp>", "LLM temperature", "0.1")
  .option("--base-url <url>", "Custom API base URL (for openai-compatible provider)")
  .option("--include-history", "Include move history in LLM prompt")
  .option("--bundled", "Use bundled puzzle set (no API calls)")
  .option("--verbose", "Show detailed breakdown by rating and theme")
  .option("-o, --output <file>", "Export results as JSON to file")
  .action(benchCommand);

program
  .command("compare")
  .description("Compare benchmark results from multiple JSON files")
  .argument("<files...>", "JSON result files to compare")
  .action(compareCommand);

program.parse();
