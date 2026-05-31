## ADDED Requirements

### Requirement: Fetch puzzle by ID
The system SHALL fetch a single puzzle from the Lichess API using its puzzle ID and return structured puzzle data including FEN, solution moves, rating, and themes.

#### Scenario: Successful puzzle fetch
- **WHEN** a valid Lichess puzzle ID is provided
- **THEN** the system returns a Puzzle object containing id, fen, moves (UCI array), rating, ratingDeviation, themes, and the last move

#### Scenario: Puzzle not found
- **WHEN** an invalid or non-existent puzzle ID is provided
- **THEN** the system SHALL throw a descriptive error indicating the puzzle was not found

### Requirement: Load bundled puzzle set
The system SHALL include a bundled set of at least 1000 curated puzzle IDs with their metadata, enabling offline and reproducible benchmark runs without API calls.

#### Scenario: Load bundled puzzles
- **WHEN** the benchmark is run with the `--bundled` flag or no API access
- **THEN** the system loads puzzles from the bundled dataset

#### Scenario: Filter bundled puzzles by rating
- **WHEN** a rating range is specified (e.g., `--min-rating 1200 --max-rating 1800`)
- **THEN** only puzzles within that range are returned

### Requirement: Filter puzzles by theme
The system SHALL allow filtering puzzles by Lichess theme tags (e.g., `fork`, `pin`, `mateIn2`, `sacrifice`).

#### Scenario: Single theme filter
- **WHEN** a theme is specified via `--themes fork`
- **THEN** only puzzles tagged with that theme are included

#### Scenario: Multiple theme filter
- **WHEN** multiple themes are specified via `--themes fork,pin`
- **THEN** only puzzles tagged with ALL specified themes are included

### Requirement: Parse puzzle FEN and apply last move
The system SHALL take the puzzle FEN (position before the opponent's move) and apply the first move from the solution to produce the position the player needs to solve.

#### Scenario: Apply opponent's last move
- **WHEN** a puzzle with FEN and solution moves is loaded
- **THEN** the system applies the first UCI move from the solution to the FEN, producing the board state to present to the LLM

### Requirement: Shuffle and seed puzzle selection
The system SHALL support random puzzle selection with a configurable seed for reproducibility.

#### Scenario: Seeded selection
- **WHEN** a seed value is provided via `--seed 42`
- **THEN** the same set of puzzles is selected in the same order across runs

#### Scenario: Unseeded selection
- **WHEN** no seed is provided
- **THEN** puzzles are selected randomly using system entropy
