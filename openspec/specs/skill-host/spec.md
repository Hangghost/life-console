## ADDED Requirements

### Requirement: Load Skills from skills/ directory
The system SHALL scan the `skills/` directory at app startup for subdirectories containing a `manifest.json`, validate the manifest format, and register discovered Skills.

#### Scenario: Valid Skill discovered
- **WHEN** `skills/subtitle-translator/` contains a valid `manifest.json` with required fields (`name`, `displayName`, `description`, `inputSchema`)
- **THEN** the system registers the Skill and displays it in the sidebar

#### Scenario: Invalid manifest ignored
- **WHEN** a `manifest.json` is missing required fields
- **THEN** the system logs a warning and skips the Skill without crashing

#### Scenario: Skill with no ui.tsx
- **WHEN** a Skill directory contains `manifest.json` and `core.ts` but no `ui.tsx`
- **THEN** the system still registers the Skill and generates a default run form from `inputSchema`

### Requirement: Skill manifest schema
Each Skill's `manifest.json` SHALL conform to the following structure: `name` (kebab-case string, unique), `displayName` (human-readable string), `description` (string), `inputSchema` (JSON Schema object defining the input), `outputSchema` (optional JSON Schema describing the output shape).

#### Scenario: Manifest with inputSchema
- **WHEN** a manifest defines `inputSchema` with a required `url` field of type `string`
- **THEN** the system generates a form with a required text input labeled "url"

### Requirement: Skill runner executes core.ts
The system SHALL provide a Skill runner that imports the Skill's `core.ts` (or compiled equivalent), calls its default-exported async function with the validated input, and returns the result.

#### Scenario: Successful Skill execution
- **WHEN** the runner calls a Skill's `core.ts` with valid input
- **THEN** the runner returns the output object and records the run in Context Store

#### Scenario: Skill execution failure
- **WHEN** the Skill's `core.ts` throws an error
- **THEN** the runner catches the error, records the failed run in Context Store, and surfaces the error message to the caller

### Requirement: Skill output auto-saved to Context Store
After every Skill execution (success or failure), the system SHALL write a record to the Context Store with: `skill_name`, `input` (JSON), `output` (JSON or null), `error` (string or null), `created_at`.

#### Scenario: Output persisted after success
- **WHEN** a Skill completes with output `{ translatedText: "..." }`
- **THEN** a record is inserted into `records` table with `skill_name="subtitle-translator"`, the input JSON, and the output JSON

#### Scenario: Error persisted after failure
- **WHEN** a Skill throws `Error("API key missing")`
- **THEN** a record is inserted with `output=null` and `error="API key missing"`
