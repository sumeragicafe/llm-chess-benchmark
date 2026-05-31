import { LLMConfig } from "../llm/types.js";

export interface BenchmarkConfig {
  provider: LLMConfig["provider"];
  model: string;
  temperature: number;
  puzzles: number;
  minRating: number;
  maxRating: number;
  themes: string[];
  seed?: number;
  concurrency: number;
  baseUrl?: string;
  includeHistory: boolean;
  bundled: boolean;
  verbose: boolean;
  outputFile?: string;
}

export interface PuzzleEvaluation {
  puzzleId: string;
  fen: string;
  playerFen: string;
  expectedMove: string;
  actualMove: string | null;
  correct: boolean;
  rating: number;
  themes: readonly string[];
  rawResponse: string;
  isMateInOne: boolean;
}

export interface RatingBracket {
  label: string;
  min: number;
  max: number;
  total: number;
  correct: number;
}

export interface ThemeResult {
  theme: string;
  total: number;
  correct: number;
}

export interface BenchmarkResult {
  model: string;
  provider: string;
  timestamp: string;
  totalPuzzles: number;
  correct: number;
  accuracy: number;
  averageRating: number;
  evaluations: PuzzleEvaluation[];
  ratingBrackets: RatingBracket[];
  themeResults: ThemeResult[];
}
