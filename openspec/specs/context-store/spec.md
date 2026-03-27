## MODIFIED Requirements

### Requirement: records table stores all Skill outputs
The system SHALL maintain a `records` table in SQLite with fields: `id` (UUID, PK), `skill_name` (TEXT, NOT NULL), `input` (TEXT/JSON), `output` (TEXT/JSON, nullable), `error` (TEXT, nullable), `created_at` (TEXT, ISO 8601). The table SHALL now include records from the two new Skills: `knowledge-ingestion` and `skill-loader`, in addition to existing user-defined Skills.

#### Scenario: Record created on Skill completion
- **WHEN** the Skill runner finishes executing `subtitle-translator` with `input={url:"..."}` and `output={translatedText:"..."}`
- **THEN** a row is inserted with `skill_name="subtitle-translator"`, the serialized input JSON, and the serialized output JSON

#### Scenario: Record created on Skill failure
- **WHEN** the Skill runner catches an error from `core.ts`
- **THEN** a row is inserted with `output=null` and `error` set to the error message string

#### Scenario: knowledge-ingestion run recorded
- **WHEN** the knowledge-ingestion Skill completes with 5 confirmed cards
- **THEN** a row is inserted with `skill_name="knowledge-ingestion"` and output containing the 5 confirmed card file paths

#### Scenario: skill-loader run recorded
- **WHEN** the skill-loader Skill writes to 2 configured targets
- **THEN** a row is inserted with `skill_name="skill-loader"` and output containing the 2 written file paths
