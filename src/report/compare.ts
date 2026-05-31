import { readFileSync } from "node:fs";
import chalk from "chalk";
import Table from "cli-table3";
import { BenchmarkResult } from "../benchmark/types.js";

export function compareResults(files: string[]): void {
  const results = files.map((f) => {
    const raw = readFileSync(f, "utf-8");
    return JSON.parse(raw) as BenchmarkResult;
  });

  console.log(chalk.bold("\n Benchmark Comparison\n"));

  const summaryTable = new Table({
    head: ["Metric", ...results.map((r) => r.model)],
    style: { head: ["cyan"] },
  });

  summaryTable.push(
    ["Provider", ...results.map((r) => r.provider)],
    ["Puzzles", ...results.map((r) => String(r.totalPuzzles))],
    ["Correct", ...results.map((r) => String(r.correct))],
    [
      "Accuracy",
      ...results.map((r) => r.accuracy.toFixed(1) + "%"),
    ],
    ["Avg Rating", ...results.map((r) => String(r.averageRating))],
  );

  console.log(summaryTable.toString());

  const allBrackets = new Set<string>();
  for (const r of results) {
    for (const b of r.ratingBrackets) allBrackets.add(b.label);
  }

  if (allBrackets.size > 0) {
    console.log(chalk.bold("\n Rating Bracket Comparison\n"));
    const bracketTable = new Table({
      head: ["Bracket", ...results.map((r) => r.model)],
      style: { head: ["cyan"] },
    });

    for (const label of Array.from(allBrackets).sort()) {
      const row = [label];
      for (const r of results) {
        const bracket = r.ratingBrackets.find((b) => b.label === label);
        if (bracket) {
          const acc = ((bracket.correct / bracket.total) * 100).toFixed(1);
          row.push(`${acc}% (${bracket.correct}/${bracket.total})`);
        } else {
          row.push("-");
        }
      }
      bracketTable.push(row);
    }

    console.log(bracketTable.toString());
  }
}
