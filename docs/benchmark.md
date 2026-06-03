# Benchmark Module

**Directory**: `src/benchmark/`

Responsible for orchestrating the benchmark run: loading puzzles, evaluating LLM moves, and aggregating results.

## Files

| File | Purpose |
|------|---------|
| `types.ts` | `BenchmarkConfig`, `PuzzleEvaluation`, `BenchmarkResult`, `RatingBracket`, `ThemeResult` |
| `config.ts` | `loadConfig()` — merges `.chess-bench.json` + CLI flags |
| `runner.ts` | `runBenchmark()` — main orchestrator, loads puzzles, runs concurrent workers |
| `evaluator.ts` | `evaluateMove()` — compares LLM move against solution |
| `aggregator.ts` | `aggregateByRatingBracket()`, `aggregateByTheme()` |
| `progress.ts` | CLI progress bar via `cli-progress`, braille fetch spinner via `unicode-animations` |

## Runner Orchestration

`runBenchmark()` in `runner.ts` is the main entry point:

1. **Create adapter** — `createAdapter()` instantiates the right LLM provider and wraps it with `withRetry()`
2. **Load puzzles** — `loadPuzzles()` either uses bundled data or fetches from Lichess API. When fetching, a braille spinner (`scan` style) animates with the current fetch count, finishing with a `●` completion indicator
3. **Evaluate concurrently** — `runConcurrent()` spins up N workers (controlled by `--concurrency`) that pull from a shared queue
4. **Aggregate** — Results are grouped by rating bracket and theme
5. **Return** `BenchmarkResult`

### Concurrent Worker Model

```
                    ┌──────────┐
  Puzzle Queue ──── │ Worker 1 │ ──┐
  (shared array) ├──│ Worker 2 │ ──┤──▶ results[] ──▶ aggregate
                    │ Worker N │ ──┘
                    └──────────┘
```

Workers pull puzzles from a shared `queue` array via `shift()`. Each worker evaluates one puzzle at a time, pushes the result, and updates the progress bar. No locks needed — JavaScript is single-threaded between `await` points.

## Move Evaluation

`evaluateMove()` compares the LLM's parsed move against `puzzle.solutionMoves[1]` (the expected response):

- **Exact match**: `actualMove === expectedMove` → correct
- **Mate-in-one alternative**: If the puzzle has the `mateIn1` theme and the LLM's move delivers checkmate (verified via chess.js), it counts as correct even if it differs from the expected move
- **Error**: If the LLM call throws, the evaluation records `null` as the move with an error message

## Aggregation

### Rating Brackets

| Bracket | Range |
|---------|-------|
| <1000 | 0–999 |
| 1000–1500 | 1000–1500 |
| 1500–2000 | 1501–2000 |
| 2000–2500 | 2001–2500 |
| 2500+ | 2501+ |

Empty brackets are omitted from output.

### Themes

Each puzzle can have multiple themes (e.g., `fork`, `pin`, `sacrifice`). Results are grouped by theme with counts and accuracy. Themes are sorted by frequency (most common first).

## Config Merging

`loadConfig()` in `config.ts` merges configuration from three sources (in priority order):

1. **CLI flags** — Highest priority
2. **`.chess-bench.json`** — Project-level defaults
3. **Hardcoded defaults** — `provider: "openai"`, `puzzles: 20`, `temperature: 0.1`, `concurrency: 5`

Example `.chess-bench.json`:
```json
{
  "provider": "gemini",
  "model": "gemini-3.5-flash",
  "puzzles": 50,
  "verbose": true
}
```
