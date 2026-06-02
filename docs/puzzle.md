# Puzzle Module

**Directory**: `src/puzzle/`

Responsible for loading chess puzzles from the Lichess database or a bundled offline dataset.

## Files

| File | Purpose |
|------|---------|
| `types.ts` | `Puzzle`, `PuzzleEntry`, `LichessPuzzleResponse` interfaces |
| `bundled.ts` | 200 enriched puzzles with `id`, `rating`, `themes`, `fen`, `solution` |
| `fetcher.ts` | `fetchPuzzleById()`, `fetchRandomPuzzles()` — Lichess API calls |
| `parser.ts` | `parsePuzzleResponse()`, `createPuzzleFromBundled()` — raw data → `Puzzle` |
| `selector.ts` | `selectPuzzles()` — filter by rating/themes, shuffle with optional seed |

## Key Types

```
Puzzle {
  id, fen, playerFen, solutionMoves, rating, ratingDeviation, themes, gameUrl, lastMove
}

PuzzleEntry {                          // Bundled dataset entry
  id, rating, themes, fen, solution   // solution[0] = opponent move, solution[1] = correct move
}
```

## Puzzle Loading Strategies

### Default mode (fetches from Lichess)

1. Take the 200 bundled puzzle IDs, shuffle them randomly
2. Fetch each puzzle via `GET /api/puzzle/{id}` with concurrent workers
3. Filter by `--min-rating`, `--max-rating`
4. Skip puzzles that fail to fetch

> **Note**: The Lichess `/api/puzzle/next` endpoint was initially used but is heavily rate-limited (429 after 1-2 calls). The current approach fetches by specific ID instead, which handles concurrency well. The `fetcher.ts` file still contains a `fetchNextPuzzle()` function for reference, but the runner does not use it.

### Bundled mode (`--bundled` flag)

1. Filter the 200 bundled `PuzzleEntry` objects by rating/themes
2. Shuffle with optional `--seed`
3. Convert to `Puzzle` objects via `createPuzzleFromBundled()` — no API calls

Both strategies produce `Puzzle` objects where `playerFen` is the position after the opponent's first move (the player's turn to find the correct response).

## How Puzzles Are Structured

Lichess puzzles are 2-move sequences: the opponent's move followed by the player's correct response. The `solution` array has `[opponentMove, correctMove]`. The `parser` applies the opponent's move to get `playerFen` — the position the LLM sees.

## Adding a New Puzzle Source

1. Create a new function in `fetcher.ts` that returns `Puzzle[]`
2. Add a new flag in `src/cli.ts` and a field in `BenchmarkConfig` (`src/benchmark/types.ts`)
3. Update `loadPuzzles()` in `src/benchmark/runner.ts` to branch on the new flag
4. Ensure all returned puzzles conform to the `Puzzle` interface
