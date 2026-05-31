## ADDED Requirements

### Requirement: Run benchmark
The system SHALL orchestrate a complete benchmark run by selecting puzzles, querying the configured LLM, evaluating responses, and collecting results.

#### Scenario: Standard benchmark run
- **WHEN** a benchmark is started with a model, puzzle count, and provider configuration
- **THEN** the system fetches the specified number of puzzles, queries the LLM for each, evaluates each response, and returns a BenchmarkResult

#### Scenario: Progress display
- **WHEN** a benchmark is running
- **THEN** the system displays a progress indicator showing puzzles completed out of total, current accuracy, and estimated time remaining

### Requirement: Evaluate move correctness
The system SHALL compare the LLM's first move response against the puzzle's expected solution. For mate-in-one puzzles, any checkmating move SHALL be accepted.

#### Scenario: Correct first move
- **WHEN** the LLM's validated move matches the expected first player move from the solution
- **THEN** the puzzle is marked as correct

#### Scenario: Incorrect move
- **WHEN** the LLM's validated move does not match the expected solution move
- **THEN** the puzzle is marked as incorrect with the expected move recorded

#### Scenario: Mate-in-one alternative
- **WHEN** the puzzle is tagged `mateIn1` and the LLM returns a different legal move that also checkmates
- **THEN** the puzzle is marked as correct

### Requirement: Configurable puzzle count
The system SHALL allow specifying the number of puzzles to evaluate via `--puzzles N` (default 20).

#### Scenario: Custom puzzle count
- **WHEN** `--puzzles 100` is specified
- **THEN** the benchmark runs against exactly 100 puzzles

### Requirement: Rating bracket analysis
The system SHALL group results by puzzle rating brackets: <1000, 1000-1500, 1500-2000, 2000-2500, 2500+.

#### Scenario: Bracket breakdown
- **WHEN** a benchmark completes
- **THEN** results include accuracy percentage for each rating bracket with at least one puzzle attempted

### Requirement: Theme-based analysis
The system SHALL group results by puzzle theme tags, reporting accuracy per theme.

#### Scenario: Theme breakdown
- **WHEN** a benchmark completes
- **THEN** results include accuracy per theme (e.g., fork: 60%, pin: 45%, sacrifice: 30%)

### Requirement: Config file support
The system SHALL read configuration from `.chess-bench.json` in the current directory, with CLI flags overriding file values.

#### Scenario: Config file defaults
- **WHEN** `.chess-bench.json` exists with `{ "provider": "openai", "model": "gpt-4o", "puzzles": 50 }`
- **THEN** those values are used as defaults

#### Scenario: CLI override
- **WHEN** both config file and CLI flags specify a value
- **THEN** the CLI flag value takes precedence
