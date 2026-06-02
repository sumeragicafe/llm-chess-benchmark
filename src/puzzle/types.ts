export interface Puzzle {
  id: string;
  fen: string;
  playerFen: string;
  solutionMoves: string[];
  rating: number;
  ratingDeviation: number;
  themes: readonly string[];
  gameUrl: string;
  lastMove: string;
}

export interface PuzzleEntry {
  id: string;
  rating: number;
  themes: readonly string[];
  fen: string;
  solution: readonly string[];
}

export interface LichessPuzzleResponse {
  puzzle: {
    id: string;
    rating: number;
    plays: number;
    solution: string[];
    themes: string[];
    fen: string;
    lastMove: string;
  };
  game: {
    id: string;
    pgn: string;
  };
}
