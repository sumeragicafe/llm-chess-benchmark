# LLM Chess Benchmark

CLI tool to benchmark LLMs on chess puzzles using the [Lichess puzzle database](https://lichess.org/training).

Fetches rated puzzles from Lichess with animated braille spinners, presents them to an LLM, and evaluates whether the model finds the correct move.

## Install

```bash
npm install
npm run build
```

## Usage

```bash
# Set your API key
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GEMINI_API_KEY=AIza...

# OpenAI (default)
node dist/cli.js bench -m gpt-5.5 -n 20 --verbose

# Anthropic
node dist/cli.js bench -m claude-opus-4.6 -p anthropic -n 20 --verbose

# Google Gemini
node dist/cli.js bench -m gemini-3.5-flash -p gemini -n 20 --verbose

# Local model via Llama.cpp
node dist/cli.js bench -m llama3 -p openai-compatible --base-url http://localhost:11434/v1 -n 20

# Save results to JSON
node dist/cli.js bench -m gpt-4o -n 50 -o results.json

# Compare two benchmark runs
node dist/cli.js compare results-gpt4o.json results-gemini.json
```

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `-m, --model` | required | LLM model name |
| `-p, --provider` | `openai` | Provider: `openai`, `anthropic`, `openai-compatible`, `gemini` |
| `-n, --puzzles` | `20` | Number of puzzles |
| `--min-rating` | `0` | Min puzzle rating |
| `--max-rating` | `9999` | Max puzzle rating |
| `--themes` | all | Comma-separated themes (e.g. `fork,pin,sacrifice`) |
| `--seed` | random | Seed for reproducible puzzle selection |
| `--concurrency` | `5` | Max concurrent LLM requests |
| `--temperature` | `0.1` | LLM temperature |
| `--verbose` | off | Show rating bracket and theme breakdowns |
| `-o, --output` | off | Export results as JSON |

## Config file

Create `.chess-bench.json` in the working directory for defaults:

```json
{
  "provider": "gemini",
  "model": "gemini-3.5-flash",
  "puzzles": 50,
  "verbose": true
}
```

CLI flags override config file values.

## Test

```bash
npm test
```

## License

GPLv3
