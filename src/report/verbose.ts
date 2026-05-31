import chalk from "chalk";
import Table from "cli-table3";
import { BenchmarkResult } from "../benchmark/types.js";

export function printRatingBrackets(result: BenchmarkResult): void {
  if (result.ratingBrackets.length === 0) return;

  console.log(chalk.bold("\n Rating Bracket Breakdown\n"));

  const table = new Table({
    head: ["Bracket", "Puzzles", "Correct", "Accuracy"],
    style: { head: ["cyan"] },
  });

  for (const bracket of result.ratingBrackets) {
    const accuracy = bracket.total > 0 ? ((bracket.correct / bracket.total) * 100).toFixed(1) : "0.0";
    table.push([bracket.label, String(bracket.total), String(bracket.correct), accuracy + "%"]);
  }

  console.log(table.toString());
}

export function printThemeBreakdown(result: BenchmarkResult): void {
  if (result.themeResults.length === 0) return;

  console.log(chalk.bold("\n Theme Breakdown\n"));

  const table = new Table({
    head: ["Theme", "Puzzles", "Correct", "Accuracy"],
    style: { head: ["cyan"] },
  });

  const topThemes = result.themeResults.slice(0, 15);
  for (const theme of topThemes) {
    const accuracy = theme.total > 0 ? ((theme.correct / theme.total) * 100).toFixed(1) : "0.0";
    table.push([theme.theme, String(theme.total), String(theme.correct), accuracy + "%"]);
  }

  console.log(table.toString());
}
