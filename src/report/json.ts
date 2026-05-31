import { writeFileSync } from "node:fs";
import { BenchmarkResult } from "../benchmark/types.js";

export function exportJson(result: BenchmarkResult, filePath: string): void {
  const output = {
    model: result.model,
    provider: result.provider,
    timestamp: result.timestamp,
    totalPuzzles: result.totalPuzzles,
    correct: result.correct,
    accuracy: Number(result.accuracy.toFixed(1)),
    averageRating: result.averageRating,
    ratingBrackets: result.ratingBrackets,
    themeResults: result.themeResults,
    evaluations: result.evaluations.map((e) => ({
      puzzleId: e.puzzleId,
      fen: e.fen,
      playerFen: e.playerFen,
      expectedMove: e.expectedMove,
      actualMove: e.actualMove,
      correct: e.correct,
      rating: e.rating,
      themes: e.themes,
      rawResponse: e.rawResponse,
    })),
  };

  writeFileSync(filePath, JSON.stringify(output, null, 2));
}
