import { Chess } from "chess.js";
import { Puzzle } from "../puzzle/types.js";
import { PuzzleEvaluation } from "./types.js";

function uciToMove(uci: string) {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length === 5 ? uci[4] : undefined,
  };
}

function isCheckmate(fen: string, moveUci: string): boolean {
  try {
    const chess = new Chess(fen);
    const m = uciToMove(moveUci);
    chess.move(m);
    return chess.isCheckmate();
  } catch {
    return false;
  }
}

export function evaluateMove(
  puzzle: Puzzle,
  actualMove: string | null,
  rawResponse: string,
): PuzzleEvaluation {
  const expectedMove = puzzle.solutionMoves[1];
  const isMateInOne = puzzle.themes.includes("mateIn1");

  let correct = false;

  if (actualMove === expectedMove) {
    correct = true;
  } else if (isMateInOne && actualMove) {
    correct = isCheckmate(puzzle.playerFen, actualMove);
  }

  return {
    puzzleId: puzzle.id,
    fen: puzzle.fen,
    playerFen: puzzle.playerFen,
    expectedMove,
    actualMove,
    correct,
    rating: puzzle.rating,
    themes: puzzle.themes,
    rawResponse,
    isMateInOne,
  };
}
