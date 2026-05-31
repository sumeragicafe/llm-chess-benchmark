## ADDED Requirements

### Requirement: Configure Gemini provider
The system SHALL support `--provider gemini` as a CLI flag, authenticating via the `GEMINI_API_KEY` environment variable.

#### Scenario: Use Gemini provider
- **WHEN** `--provider gemini` is specified and `GEMINI_API_KEY` is set
- **THEN** the system uses the Google Gemini API to query the specified model

#### Scenario: Missing Gemini API key
- **WHEN** `--provider gemini` is specified and `GEMINI_API_KEY` is not set
- **THEN** the system SHALL exit with a clear error message indicating that `GEMINI_API_KEY` must be set

### Requirement: Query Gemini for chess moves
The system SHALL use the `@google/genai` SDK to send chess puzzle prompts to Gemini models and return the text response.

#### Scenario: Successful Gemini query
- **WHEN** a puzzle FEN and turn are provided to the Gemini adapter
- **THEN** the adapter calls `generateContent` with the prompt text, configured model, and temperature, and returns the trimmed text response

#### Scenario: Gemini API error
- **WHEN** the Gemini API returns an error (rate limit, invalid key, etc.)
- **THEN** the adapter SHALL throw the error so the retry logic in `rate-limit.ts` handles it

### Requirement: Support Gemini model selection
The system SHALL allow specifying any Gemini model name via the `--model` flag (e.g., `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3.5-flash`).

#### Scenario: Custom Gemini model
- **WHEN** `--provider gemini --model gemini-2.5-pro` is specified
- **THEN** the system queries the `gemini-2.5-pro` model via the Gemini API
