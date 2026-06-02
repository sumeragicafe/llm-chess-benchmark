# Report Module

**Directory**: `src/report/`

Responsible for formatting benchmark results for display and export.

## Files

| File | Purpose |
|------|---------|
| `table.ts` | `printSummaryTable()` — main results table |
| `verbose.ts` | `printRatingBrackets()`, `printThemeBreakdown()` — detailed breakdowns |
| `json.ts` | `exportJson()` — write results to JSON file |
| `compare.ts` | `compareResults()` — side-by-side comparison of multiple runs |

## Output Formats

### Summary Table (default)

Printed after every `bench` run. Uses `cli-table3` with `chalk` coloring:

```
 Metric      | Value
-------------+------------------
 Model       | gpt-5.5
 Provider    | openai
 Puzzles     | 20
 Correct     | 14
 Accuracy    | 70.0%  (green >= 70%, yellow >= 40%, red < 40%)
 Avg Rating  | 1543
 Timestamp   | 2026-06-02T...
```

### Verbose Breakdown (`--verbose`)

Two additional tables:

**Rating Bracket Breakdown** — Accuracy per rating bracket (see [benchmark.md](benchmark.md#rating-brackets) for bracket definitions)

**Theme Breakdown** — Top 15 themes sorted by frequency, showing puzzles/correct/accuracy per theme

### JSON Export (`-o results.json`)

Writes a `BenchmarkResult` object to disk with all fields: model info, summary stats, per-puzzle evaluations, rating brackets, and theme results. Used as input for the `compare` command.

### Multi-Run Comparison (`compare` command)

Reads 2+ JSON result files and prints:
- **Summary comparison**: Models side-by-side with provider, puzzles, correct, accuracy, avg rating
- **Rating bracket comparison**: Each bracket row shows accuracy across all models (e.g., `75.0% (3/4)`)

## Adding a New Report Format

1. Create a new file in `src/report/` (e.g., `csv.ts`)
2. Import `BenchmarkResult` from `src/benchmark/types.ts`
3. Write a function that takes `BenchmarkResult` and produces output
4. Wire it into `src/commands/bench.ts` — add a CLI flag, check it after the benchmark runs, call your function
5. For comparison formats, wire into `src/commands/compare.ts`
