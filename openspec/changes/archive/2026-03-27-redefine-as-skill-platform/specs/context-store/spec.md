## ADDED Requirements

### Requirement: records table stores all Skill outputs
The system SHALL maintain a `records` table in SQLite with fields: `id` (UUID, PK), `skill_name` (TEXT, NOT NULL), `input` (TEXT/JSON), `output` (TEXT/JSON, nullable), `error` (TEXT, nullable), `created_at` (TEXT, ISO 8601).

#### Scenario: Record created on Skill completion
- **WHEN** the Skill runner finishes executing `subtitle-translator` with `input={url:"..."}` and `output={translatedText:"..."}`
- **THEN** a row is inserted with `skill_name="subtitle-translator"`, the serialized input JSON, and the serialized output JSON

#### Scenario: Record created on Skill failure
- **WHEN** the Skill runner catches an error from `core.ts`
- **THEN** a row is inserted with `output=null` and `error` set to the error message string

### Requirement: Query records by skill_name
The system SHALL support querying records filtered by `skill_name`, ordered by `created_at` descending, with an optional `limit`.

#### Scenario: Query recent runs for a Skill
- **WHEN** the system queries records with `skill_name="subtitle-translator"` and `limit=10`
- **THEN** the system returns the 10 most recent records for that Skill

### Requirement: Context Store exposed via IPC
The main process SHALL expose IPC channels `context:insert` and `context:query` accessible from the renderer via preload bridge.

#### Scenario: Renderer queries Context Store
- **WHEN** renderer invokes `context:query` with `{ skillName: "subtitle-translator", limit: 5 }`
- **THEN** main process returns up to 5 most recent records for that Skill

### Requirement: Context Store schema MCP-compatible
The `records` table structure SHALL be designed so that a future MCP Server can read it directly via SQL queries. No migration SHALL be required when adding MCP support in Phase 2.

#### Scenario: MCP Server reads records
- **WHEN** a Phase 2 MCP Server opens the same SQLite database
- **THEN** it can query `SELECT * FROM records WHERE skill_name = ? ORDER BY created_at DESC` without schema changes
