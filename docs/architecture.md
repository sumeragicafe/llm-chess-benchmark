# Architecture

## Overview

LLM Chess Benchmark is a CLI tool that evaluates LLMs on chess puzzles from the [Lichess puzzle database](https://lichess.org/training). It fetches puzzles, presents them to an LLM, and evaluates whether the model finds the correct move.

## Pipeline

```
┌──────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   CLI     │────▶│  Puzzle Module  │────▶│  LLM Module  │────▶│  Benchmark   │────▶│   Report    │
│ (commands)│     │  (puzzle/)      │     │  (llm/)      │     │  Module      │     │  Module     │
│           │     │                 │     │              │     │ (benchmark/) │     │ (report/)   │
└──────────┘     └─────────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
     │                    │                      │                     │                    │
     │              Select puzzles          Build prompt          Evaluate move       Format output
     │              Fetch from Lichess     Call LLM API          Compare to solution  Terminal / JSON
     │              Or use bundled set     Parse UCI/SAN         Aggregate results    Comparison
```

### Data Flow

1. **CLI** parses flags and config file, validates provider/API key
2. **Puzzle Module** loads puzzles — either from bundled dataset (`--bundled`) or by fetching from Lichess API by shuffled bundled IDs
3. **LLM Module** builds a prompt from the FEN position, calls the configured provider, parses the response into a UCI move
4. **Benchmark Module** compares the LLM's move against the puzzle solution, handles mate-in-one alternatives, aggregates by rating bracket and theme
5. **Report Module** outputs results as a terminal table, verbose breakdown, JSON file, or multi-run comparison

## Module Map

| Module | Directory | Description | Docs |
|--------|-----------|-------------|------|
| **Commands** | `src/commands/` | CLI entry points, config validation | (covered below) |
| **Puzzle** | `src/puzzle/` | Puzzle types, fetching, selection, bundled dataset | [puzzle.md](puzzle.md) |
| **LLM** | `src/llm/` | Provider adapters, prompt building, move parsing, rate limiting | [llm.md](llm.md) |
| **Benchmark** | `src/benchmark/` | Runner orchestration, evaluation, aggregation, config | [benchmark.md](benchmark.md) |
| **Report** | `src/report/` | Terminal tables, verbose output, JSON export, comparison | [report.md](report.md) |

### Commands Module

`src/commands/` contains two CLI command handlers:

- **`bench.ts`** — The `bench` command. Loads config, validates provider/API key, runs the benchmark, prints results, optionally exports JSON.
- **`compare.ts`** — The `compare` command. Reads 2+ JSON result files and prints a side-by-side comparison table.

Both are wired to Commander in `src/cli.ts`.

## Extending the System

See the per-module docs for detailed extension guides:

- **Adding an LLM provider**: See [llm.md](llm.md#adding-a-new-provider)
- **Adding a puzzle source**: See [puzzle.md](puzzle.md#adding-a-new-puzzle-source)
- **Adding a report format**: See [report.md](report.md#adding-a-new-report-format)
