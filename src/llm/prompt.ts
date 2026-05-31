import { PromptOptions } from "./types.js";

export function buildPrompt(fen: string, turn: "w" | "b", options?: PromptOptions): string {
  const turnLabel = turn === "w" ? "White" : "Black";
  const lines: string[] = [
    `You are given a chess position in FEN notation: ${fen}`,
    `It is ${turnLabel}'s turn to move.`,
    `Find the best move for ${turnLabel}.`,
    `Respond with ONLY the move in UCI notation (e.g., e2e4, b1c3, e7e8q for promotion).`,
    `Do not include any explanation or commentary.`,
  ];

  if (options?.includeHistory && options.pgn) {
    lines.splice(1, 0, `The game so far (PGN): ${options.pgn}`);
  }

  return lines.join("\n");
}
