## ADDED Requirements

### Requirement: Terminal table output
The system SHALL display benchmark results as a formatted table in the terminal showing model name, total puzzles, correct count, accuracy percentage, and average puzzle rating.

#### Scenario: Basic results table
- **WHEN** a benchmark completes
- **THEN** the terminal displays a table with columns: Model, Puzzles, Correct, Accuracy, Avg Rating

### Requirement: Detailed breakdown output
The system SHALL optionally display detailed breakdowns by rating bracket and theme when `--verbose` is specified.

#### Scenario: Verbose rating breakdown
- **WHEN** `--verbose` is enabled
- **THEN** the terminal displays a table of accuracy per rating bracket

#### Scenario: Verbose theme breakdown
- **WHEN** `--verbose` is enabled
- **THEN** the terminal displays a table of accuracy per puzzle theme, sorted by frequency

### Requirement: JSON export
The system SHALL export full results as JSON via `--output results.json`, including per-puzzle details (puzzle ID, expected move, actual move, correct, themes, rating).

#### Scenario: JSON file output
- **WHEN** `--output results.json` is specified
- **THEN** a JSON file is written with the complete benchmark results including per-puzzle details

#### Scenario: JSON structure
- **WHEN** JSON output is written
- **THEN** it includes: model name, provider, timestamp, total puzzles, correct count, accuracy, puzzle list with individual results, and bracket/theme breakdowns

### Requirement: Comparative output
The system SHALL support comparing multiple benchmark result JSON files via `--compare file1.json file2.json`, displaying a side-by-side comparison table.

#### Scenario: Compare two models
- **WHEN** `--compare gpt4-results.json claude-results.json` is specified
- **THEN** the terminal displays a comparison table showing accuracy, bracket performance, and theme performance for each model side by side
