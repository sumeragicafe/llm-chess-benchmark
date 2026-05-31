import chalk from "chalk";
import Table from "cli-table3";
import { BenchmarkResult } from "../benchmark/types.js";

export function printSummaryTable(result: BenchmarkResult): void {
  console.log(chalk.bold("\n Benchmark Results\n"));

  const table = new Table({
    head: ["Metric", "Value"],
    style: { head: ["cyan"] },
  });

  table.push(
    ["Model", result.model],
    ["Provider", result.provider],
    ["Puzzles", String(result.totalPuzzles)],
    ["Correct", String(result.correct)],
    ["Accuracy", formatAccuracy(result.accuracy)],
    ["Avg Rating", String(result.averageRating)],
    ["Timestamp", result.timestamp],
  );

  console.log(table.toString());
}

function formatAccuracy(accuracy: number): string {
  const formatted = accuracy.toFixed(1) + "%";
  if (accuracy >= 70) return chalk.green(formatted);
  if (accuracy >= 40) return chalk.yellow(formatted);
  return chalk.red(formatted);
}
