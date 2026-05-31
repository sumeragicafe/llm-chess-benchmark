import { Chess } from "chess.js";
import { LichessPuzzleResponse, Puzzle } from "./types.js";

function uciToMove(uci: string) {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length === 5 ? uci[4] : undefined,
  };
}

export function parsePuzzleResponse(raw: LichessPuzzleResponse): Puzzle {
  const { puzzle } = raw;

  const chess = new Chess(puzzle.fen);
  const opponentMove = uciToMove(puzzle.solution[0]);
  chess.move(opponentMove);

  const playerFen = chess.fen();

  return {
    id: puzzle.id,
    fen: puzzle.fen,
    playerFen,
    solutionMoves: puzzle.solution,
    rating: puzzle.rating,
    ratingDeviation: 0,
    themes: puzzle.themes,
    gameUrl: `https://lichess.org/${raw.game.id}`,
    lastMove: puzzle.lastMove,
  };
}
