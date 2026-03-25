## ADDED Requirements

### Requirement: Manual text input creates inbox item
The system SHALL allow users to input free-form text which is immediately saved as an inbox_item object with source="manual" and ai_metadata.inferred_type=null.

#### Scenario: User enters text in inbox
- **WHEN** user types "明天跟 John 討論 API 設計" and submits
- **THEN** the system immediately creates an inbox_item object with the text as content, without waiting for AI inference

### Requirement: Async AI type inference via Claude API
The system SHALL send the inbox item's content to Claude API in the background to infer the type (task or note) and extract structured properties. The inference SHALL NOT block the UI.

#### Scenario: Successful inference
- **WHEN** an inbox_item is created
- **THEN** the system sends a background Claude API request and, upon response, updates the object's ai_metadata with inferred_type, inference_confidence, and suggested properties

#### Scenario: Inference timeout or failure
- **WHEN** the Claude API call times out or fails
- **THEN** the object remains as inbox_item with ai_metadata.inferred_type=null, and no error is shown to the user

### Requirement: Inference confirmation UI
The system SHALL display a confirmation prompt when inference completes, showing the suggested type, extracted title, and properties. The user can confirm, change type, or keep as unclassified.

#### Scenario: User confirms suggested type
- **WHEN** inference suggests type="task" with confidence=0.85 and user clicks "確認"
- **THEN** the system changes the object's type from "inbox_item" to "task" and fills in the suggested properties (priority, due_date, etc.)

#### Scenario: User overrides suggested type
- **WHEN** inference suggests type="task" but user clicks "改為 Note"
- **THEN** the system changes the object's type to "note" and records the correction in ai_metadata.user_corrections

#### Scenario: User keeps unclassified
- **WHEN** user clicks "保持未分類"
- **THEN** the object remains as inbox_item in the Inbox

### Requirement: Inference prompt produces structured JSON
The Claude API prompt SHALL request output in strict JSON format containing: type (task/note/null), confidence (0-1), title (string), and properties (object matching the target type's schema). The prompt SHALL only distinguish between task and note.

#### Scenario: Ambiguous input
- **WHEN** the input text is ambiguous and Claude cannot determine the type
- **THEN** Claude returns type=null and the system shows the item without a suggestion

### Requirement: Inbox displays all unclassified items
The Inbox page SHALL display all objects with type="inbox_item" that are not archived, ordered by created_at descending.

#### Scenario: Inbox list view
- **WHEN** user navigates to Inbox
- **THEN** the system shows all inbox_item objects with their title/content, and any pending inference results
