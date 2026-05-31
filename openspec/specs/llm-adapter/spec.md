## ADDED Requirements

### Requirement: Configure LLM provider
The system SHALL support configuring LLM providers via CLI flags (`--provider openai|anthropic|openai-compatible|gemini`) and corresponding API keys via environment variables.

#### Scenario: Use OpenAI provider
- **WHEN** `--provider openai` is specified and `OPENAI_API_KEY` is set
- **THEN** the system uses the OpenAI API to query the specified model

#### Scenario: Use Anthropic provider
- **WHEN** `--provider anthropic` is specified and `ANTHROPIC_API_KEY` is set
- **THEN** the system uses the Anthropic API to query the specified model

#### Scenario: Use OpenAI-compatible provider
- **WHEN** `--provider openai-compatible` is specified along with `--base-url`
- **THEN** the system uses a custom OpenAI-compatible endpoint (e.g., Ollama, vLLM, local models)

#### Scenario: Use Gemini provider
- **WHEN** `--provider gemini` is specified and `GEMINI_API_KEY` is set
- **THEN** the system uses the Google Gemini API to query the specified model

#### Scenario: Missing API key
- **WHEN** the required API key for the selected provider is not set
- **THEN** the system SHALL exit with a clear error message indicating which environment variable to set

### Requirement: Construct chess puzzle prompt
The system SHALL construct a prompt for the LLM that includes the board state (FEN), clear instructions, and asks for a single best move in either UCI or SAN notation.

#### Scenario: Standard puzzle prompt
- **WHEN** a puzzle position is prepared for the LLM
- **THEN** the prompt includes the FEN string, whose turn it is, and instructions to respond with a single move

#### Scenario: Include move history
- **WHEN** `--include-history` is enabled and the source game PGN is available
- **THEN** the prompt includes the move history leading to the puzzle position for additional context

### Requirement: Parse LLM move response
The system SHALL parse the LLM's text response to extract a chess move, supporting UCI notation (e.g., `e2e4`), SAN notation (e.g., `Nf3`), and common variations (e.g., `e2-e4`, `Nxf3+`).

#### Scenario: Parse UCI response
- **WHEN** the LLM responds with a move in UCI format like `c6g2`
- **THEN** the system extracts the move as a UCI string

#### Scenario: Parse SAN response
- **WHEN** the LLM responds with a move in SAN format like `Qg2`
- **THEN** the system converts it to UCI using chess.js for comparison with the solution

#### Scenario: Ambiguous or invalid response
- **WHEN** the LLM response contains no recognizable chess move
- **THEN** the system SHALL mark the response as unparseable and count it as incorrect

### Requirement: Validate extracted move
The system SHALL validate the extracted move against the legal moves in the position using chess.js.

#### Scenario: Legal move
- **WHEN** the extracted move is a legal move in the current position
- **THEN** the system returns the validated UCI move

#### Scenario: Illegal move
- **WHEN** the extracted move is not legal in the current position
- **THEN** the system SHALL mark the response as illegal and count it as incorrect

### Requirement: Respect concurrency and rate limits
The system SHALL send LLM requests with configurable concurrency (default 5) and include per-provider rate limiting to avoid API throttling.

#### Scenario: Concurrent requests
- **WHEN** benchmarking with `--concurrency 10`
- **THEN** the system sends up to 10 simultaneous requests to the LLM provider

#### Scenario: Rate limit enforcement
- **WHEN** the provider returns a 429 rate limit response
- **THEN** the system SHALL back off and retry after the indicated wait period
