## ADDED Requirements

### Requirement: Spinner animation during puzzle fetching
When fetching puzzles from the Lichess API, the system SHALL display an animated braille spinner using the `scan` style from `unicode-animations`, showing the current fetch count and total target count.

#### Scenario: Fetching puzzles from Lichess API
- **WHEN** the benchmark runs in default mode (not `--bundled`) and puzzles are being fetched from Lichess
- **THEN** the terminal SHALL display an animated spinner line in the format `{frame} Fetching {count}/{total} puzzles from Lichess...` where `{frame}` cycles through the `scan` braille animation frames at 70ms intervals and `{count}` updates as puzzles are successfully fetched

#### Scenario: Bundled mode skips spinner
- **WHEN** the benchmark runs with `--bundled` flag
- **THEN** no spinner SHALL be displayed during puzzle loading since puzzles load instantly from memory

### Requirement: Fetch completion indicator
When puzzle fetching completes, the system SHALL replace the spinner with a static completion line using the `●` solid dot character.

#### Scenario: Fetching completes successfully
- **WHEN** all requested puzzles have been fetched from the Lichess API
- **THEN** the spinner line SHALL be replaced with `● Fetched {count} puzzles from Lichess` where `{count}` is the actual number of puzzles loaded

#### Scenario: Fetching completes with fewer puzzles than requested
- **WHEN** puzzle fetching finishes but fewer puzzles were loaded than requested (e.g. due to rating filters or network errors)
- **THEN** the completion line SHALL still display with the actual count loaded: `● Fetched {count} puzzles from Lichess`

### Requirement: Evaluation progress bar unchanged
The existing `cli-progress` bar used during the evaluation phase SHALL NOT be modified by this change.

#### Scenario: Evaluation phase after spinner
- **WHEN** puzzle fetching completes and the spinner finishes, then the evaluation phase begins
- **THEN** the existing `cli-progress` bar SHALL appear and function exactly as before, with no changes to its format, characters, or behavior
