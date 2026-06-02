import { LichessPuzzleResponse, Puzzle } from "./types.js";
import { parsePuzzleResponse } from "./parser.js";

const LICHESS_API = "https://lichess.org/api";

export async function fetchPuzzleById(id: string): Promise<LichessPuzzleResponse> {
  const res = await fetch(`${LICHESS_API}/puzzle/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch puzzle ${id}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<LichessPuzzleResponse>;
}

async function fetchNextPuzzle(): Promise<LichessPuzzleResponse> {
  const res = await fetch(`${LICHESS_API}/puzzle/next`);
  if (!res.ok) {
    throw new Error(`Failed to fetch random puzzle: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<LichessPuzzleResponse>;
}

export async function fetchRandomPuzzles(options: {
  count: number;
  minRating?: number;
  maxRating?: number;
  concurrency?: number;
  bundledIds?: string[];
}): Promise<Puzzle[]> {
  const concurrency = options.concurrency ?? 3;
  const puzzles: Puzzle[] = [];
  let attempts = 0;
  const maxAttempts = options.count * 5;

  async function tryFetchOne(): Promise<Puzzle | null> {
    const raw = await fetchNextPuzzle();
    const puzzle = parsePuzzleResponse(raw);
    if (options.minRating && puzzle.rating < options.minRating) return null;
    if (options.maxRating && puzzle.rating > options.maxRating) return null;
    return puzzle;
  }

  async function fetchOneById(): Promise<Puzzle | null> {
    if (!options.bundledIds || options.bundledIds.length === 0) return null;
    const id = options.bundledIds.pop()!;
    const raw = await fetchPuzzleById(id);
    const puzzle = parsePuzzleResponse(raw);
    if (options.minRating && puzzle.rating < options.minRating) return null;
    if (options.maxRating && puzzle.rating > options.maxRating) return null;
    return puzzle;
  }

  async function fetchOne(): Promise<Puzzle | null> {
    try {
      return await tryFetchOne();
    } catch {
      return await fetchOneById();
    }
  }

  async function worker() {
    while (puzzles.length < options.count && attempts < maxAttempts) {
      attempts++;
      try {
        const puzzle = await fetchOne();
        if (puzzle) puzzles.push(puzzle);
      } catch {
        // skip
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, options.count) }, () => worker());
  await Promise.all(workers);

  return puzzles.slice(0, options.count);
}
