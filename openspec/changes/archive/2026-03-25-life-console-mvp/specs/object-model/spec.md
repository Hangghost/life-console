## ADDED Requirements

### Requirement: Objects table stores all entities
The system SHALL store all entities in a single `objects` table with fields: `id` (UUID, PK), `type` (TEXT, NOT NULL), `title` (TEXT), `content` (TEXT), `properties` (TEXT/JSON), `source` (TEXT), `ai_metadata` (TEXT/JSON), `created_at` (ISO 8601), `updated_at` (ISO 8601), `archived` (INTEGER DEFAULT 0).

#### Scenario: Create a new object
- **WHEN** a new object is created with type "task" and title "Fix bug"
- **THEN** the system stores a row with a generated UUID, type="task", the given title, created_at and updated_at set to current time, and archived=0

#### Scenario: Object types supported
- **WHEN** an object is created with type "inbox_item", "task", "note", or "workflow_run"
- **THEN** the system accepts and stores it

### Requirement: Relations table links objects
The system SHALL maintain a `relations` table with fields: `id` (UUID, PK), `from_id` (FK → objects), `to_id` (FK → objects), `type` (TEXT, NOT NULL), `created_at` (ISO 8601). Supported relation types: `produces`, `relates_to`, `subtask_of`, `derived_from`.

#### Scenario: Create a relation between objects
- **WHEN** a relation of type "produces" is created from object A to object B
- **THEN** the system stores the relation with a generated UUID and current timestamp

### Requirement: CRUD operations for objects
The system SHALL support Create, Read, Update, and Delete (soft-delete via archived flag) operations on objects.

#### Scenario: Update object properties
- **WHEN** an object's properties JSON is updated
- **THEN** the system updates the properties field and sets updated_at to current time

#### Scenario: Soft-delete an object
- **WHEN** an object is deleted
- **THEN** the system sets archived=1 instead of removing the row

#### Scenario: Query objects by type and status
- **WHEN** objects are queried with filter type="task" and properties.status="todo"
- **THEN** the system returns all non-archived objects matching the criteria

### Requirement: Full-text search across objects
The system SHALL support full-text search across object title and content fields using SQLite FTS5.

#### Scenario: Search returns matching objects
- **WHEN** user searches for "API design"
- **THEN** the system returns all non-archived objects whose title or content contains the search terms, ranked by relevance

### Requirement: Properties schema per type
The system SHALL enforce the following properties structures per type:
- **task**: status (todo/in_progress/done/blocked), priority (low/medium/high/urgent), due_date, estimated_minutes, category, recurrence
- **note**: tags (array), source_url, source_tool
- **inbox_item**: suggested_type, suggested_confidence, raw_input
- **workflow_run**: tool_name, tool_version, input_params, status (running/completed/failed), duration_ms, output_object_ids

#### Scenario: Task object with valid properties
- **WHEN** a task object is created with properties { status: "todo", priority: "high", due_date: "2026-04-01" }
- **THEN** the system stores the object with these properties in the JSON field

### Requirement: AI metadata on all objects
The system SHALL support an `ai_metadata` JSON field on all objects with structure: inferred_type, inference_confidence, last_inference_model (claude/manual), user_corrections (array of {field, from, to, timestamp}).

#### Scenario: Record user correction
- **WHEN** user changes an object's type from "note" to "task"
- **THEN** the system appends a correction entry to ai_metadata.user_corrections with the field, old value, new value, and timestamp
