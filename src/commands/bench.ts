import { runBenchmark } from "../benchmark/runner.js";
import { loadConfig } from "../benchmark/config.js";
import { printSummaryTable } from "../report/table.js";
import { printRatingBrackets, printThemeBreakdown } from "../report/verbose.js";
import { exportJson } from "../report/json.js";

export async function benchCommand(options: Record<string, string | boolean | undefined>) {
  const config = loadConfig(options);

  validateConfig(config);

  console.log(`Running benchmark: ${config.model} (${config.provider}) on ${config.puzzles} puzzles...\n`);

  const result = await runBenchmark(config);

  printSummaryTable(result);

  if (config.verbose) {
    printRatingBrackets(result);
    printThemeBreakdown(result);
  }

  if (config.outputFile) {
    exportJson(result, config.outputFile);
    console.log(`\nResults exported to ${config.outputFile}`);
  }
}

function validateConfig(config: ReturnType<typeof loadConfig>) {
  if (!config.model) {
    console.error("Error: --model is required");
    process.exit(1);
  }

  const validProviders = ["openai", "anthropic", "openai-compatible", "gemini"];
  if (!validProviders.includes(config.provider)) {
    console.error(`Error: Invalid provider "${config.provider}". Must be one of: ${validProviders.join(", ")}`);
    process.exit(1);
  }

  if (config.provider === "openai" && !process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is required for the openai provider");
    process.exit(1);
  }

  if (config.provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is required for the anthropic provider");
    process.exit(1);
  }

  if (config.provider === "openai-compatible" && !config.baseUrl) {
    console.error("Error: --base-url is required for the openai-compatible provider");
    process.exit(1);
  }

  if (config.provider === "gemini" && !process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is required for the gemini provider");
    process.exit(1);
  }
}
