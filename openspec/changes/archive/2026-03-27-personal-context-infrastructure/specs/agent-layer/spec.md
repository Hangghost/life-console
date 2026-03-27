## ADDED Requirements

### Requirement: Agent Layer stored as Markdown files in Life Console userData
The system SHALL store Agent Layer files in `~/Library/Application Support/life-console/agent/` with subdirectories: `axioms/` (decision principles), `methodologies/` (thinking frameworks with version history), `skills/` (work SOPs). These files SHALL NOT be user-configurable in path.

#### Scenario: Agent Layer directory initialized on first launch
- **WHEN** Life Console starts for the first time
- **THEN** the agent directory structure is created with empty subdirectories and a README explaining the format

### Requirement: Axiom file format
Each axiom SHALL be a Markdown file in `axioms/` with frontmatter: `id` (e.g., "a01"), `title` (short phrase), `category` ("architecture" | "methodology" | "technical" | "values"), `created_at`, `last_updated`. The file body SHALL contain: the principle statement, a **Why:** line (origin or evidence), and a **When to apply:** line (trigger conditions).

#### Scenario: Axiom file is parseable by LLMs
- **WHEN** an LLM reads an axiom file
- **THEN** it can extract the principle, why, and when-to-apply without additional schema documentation

### Requirement: Methodology file format with version history
Each methodology SHALL be a Markdown file in `methodologies/` with frontmatter: `id`, `title`, `applicable_to` (string array of contexts), `created_at`, `version` (integer). The file body SHALL contain: steps/process, judgment principles, known exceptions, and a `## Version History` section listing previous versions with dates and change summaries.

#### Scenario: Methodology updated after distillation
- **WHEN** user confirms a methodology update in the distillation chat
- **THEN** the existing version is appended to `## Version History` and the file body is updated with the new content, with `version` incremented

### Requirement: Agent Layer readable by the distillation-chat system prompt
The Agent Layer Markdown files SHALL be designed so that concatenating all files in axioms/ and the relevant methodology file produces a coherent system prompt context under 3000 tokens for a typical user with 10-20 axioms and 3-5 methodologies.

#### Scenario: Full Agent Layer fits in context budget
- **WHEN** the distillation-chat loads all axioms and methodologies
- **THEN** the total token count of the injected context is under 4000 tokens (measured by cl100k tokenizer)

### Requirement: Agent Layer files are versioned via file modification time
The system SHALL use file modification timestamps to determine the "last updated" time for Agent Layer files. No additional version database is required in Phase 1.

#### Scenario: File modification time reflects last distillation
- **WHEN** a distillation chat writes back to an axiom file
- **THEN** the file's modification timestamp is updated to the current time
